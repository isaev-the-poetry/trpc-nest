import { Controller, Post, Get, Param, Body, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AutoRouterService } from './auto-router.service';
import { createMainRouter } from './main-router';

/**
 * Автоматический контроллер для обработки tRPC HTTP запросов
 * Поддерживает одиночные запросы и batch операции
 */
@Controller('trpc')
export class TrpcHttpController {
  private readonly logger = new Logger(TrpcHttpController.name);

  constructor(private readonly autoRouterService: AutoRouterService) {}

  /**
   * Обработка одиночных tRPC процедур
   * POST /trpc/procedureName
   */
  @Post(':procedure')
  async handleSingleProcedure(@Param('procedure') procedure: string, @Body() input: any) {
    this.logger.debug(`Single tRPC call: ${procedure}`, { input });
    
    try {
      const result = await this.executeProcedure(procedure, input);
      return {
        procedure,
        input,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error(`Error in tRPC call ${procedure}:`, error);
      throw new HttpException(
        {
          error: error.message || 'Internal server error',
          procedure,
          timestamp: new Date().toISOString()
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Обработка GET batch запросов в формате: procedures,procedure2,procedure3?batch=1&input=...
   * GET /trpc/procedure1,procedure2,procedure3?batch=1&input=batchInputJSON
   */
  @Get(':procedures')
  async handleGetBatchProcedures(
    @Param('procedures') procedures: string,
    @Query('batch') batch?: string,
    @Query('input') inputParam?: string
  ) {
    // Проверяем, является ли это batch запросом
    if (batch === '1' && procedures.includes(',')) {
      this.logger.debug(`GET Batch tRPC call: ${procedures}`, { inputParam });
      
      try {
        const procedureList = procedures.split(',').map(p => p.trim());
        let batchInput: Record<string, any> = {};
        
        if (inputParam) {
          try {
            batchInput = JSON.parse(decodeURIComponent(inputParam));
          } catch (parseError) {
            throw new HttpException(
              {
                error: 'Invalid input parameter. Must be valid JSON.',
                procedures: procedureList,
                timestamp: new Date().toISOString()
              },
              HttpStatus.BAD_REQUEST
            );
          }
        }

        const batchResults: Record<string, any> = {};
        const promises: Promise<void>[] = [];

        // Обрабатываем каждую процедуру в batch запросе
        procedureList.forEach((procedure, index) => {
          const indexKey = index.toString();
          const input = batchInput[indexKey]?.json || batchInput[indexKey] || {};
          
          promises.push(
            this.executeProcedure(procedure, input)
              .then(result => {
                batchResults[indexKey] = {
                  result,
                  timestamp: new Date().toISOString()
                };
              })
              .catch(error => {
                batchResults[indexKey] = {
                  error: {
                    message: error.message || 'Operation failed',
                    code: error.code || 'INTERNAL_ERROR'
                  }
                };
              })
          );
        });

        // Ждем выполнения всех операций
        await Promise.all(promises);

        return batchResults;
      } catch (error: any) {
        if (error instanceof HttpException) {
          throw error;
        }
        
        this.logger.error(`Error in GET batch tRPC call ${procedures}:`, error);
        throw new HttpException(
          {
            error: error.message || 'Batch request failed',
            procedures: procedures.split(','),
            timestamp: new Date().toISOString()
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
    
    // Если это не batch запрос, обрабатываем как обычный GET запрос
    return this.handleGetProcedure(procedures, inputParam);
  }

  /**
   * Обработка GET запросов для query операций (приватный метод)
   * Теперь вызывается из handleGetBatchProcedures для одиночных запросов
   */
  private async handleGetProcedure(procedure: string, inputParam?: string) {
    this.logger.debug(`GET tRPC call: ${procedure}`, { inputParam });
    
    try {
      let input = {};
      if (inputParam) {
        try {
          input = JSON.parse(decodeURIComponent(inputParam));
        } catch (parseError) {
          throw new HttpException(
            {
              error: 'Invalid input parameter. Must be valid JSON.',
              procedure,
              timestamp: new Date().toISOString()
            },
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const result = await this.executeProcedure(procedure, input);
      return {
        procedure,
        input,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`Error in GET tRPC call ${procedure}:`, error);
      throw new HttpException(
        {
          error: error.message || 'Internal server error',
          procedure,
          timestamp: new Date().toISOString()
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Обработка batch запросов согласно tRPC спецификации
   * POST /trpc - для batch операций
   */
  @Post()
  async handleBatchRequests(@Body() batchInput: any) {
    this.logger.debug('Batch tRPC call', { batchSize: Object.keys(batchInput || {}).length });
    
    try {
      if (!batchInput || typeof batchInput !== 'object') {
        throw new HttpException(
          {
            error: 'Invalid batch request format. Expected object with numbered keys.',
            timestamp: new Date().toISOString()
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const batchResults: Record<string, any> = {};
      const promises: Promise<void>[] = [];

      // Обрабатываем каждый элемент batch запроса
      for (const [key, operation] of Object.entries(batchInput)) {
        promises.push(
          this.processBatchOperation(key, operation as any)
            .then(result => {
              batchResults[key] = result;
            })
            .catch(error => {
              batchResults[key] = {
                error: {
                  message: error.message || 'Operation failed',
                  code: error.code || 'INTERNAL_ERROR'
                }
              };
            })
        );
      }

      // Ждем выполнения всех операций
      await Promise.all(promises);

      return batchResults;
    } catch (error: any) {
      this.logger.error('Error in batch tRPC call:', error);
      throw new HttpException(
        {
          error: error.message || 'Batch request failed',
          timestamp: new Date().toISOString()
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Информационный endpoint для отладки
   * GET /trpc - показывает доступные процедуры
   */
  @Get()
  getTrpcInfo() {
    const registeredControllers = this.autoRouterService.getRegisteredControllers();
    const availableProcedures = this.getAvailableProcedures();
    const routerInfo = this.getRouterIntrospectionInfo();
    
    return {
      message: 'tRPC HTTP Endpoint',
      version: '1.1.0',
      endpoints: {
        single: 'POST /trpc/:procedure - для одиночных операций',
        get: 'GET /trpc/:procedure?input=encodedJSON - для query операций',
        getBatch: 'GET /trpc/:procedures?batch=1&input=batchInputJSON - для GET batch операций',
        batch: 'POST /trpc - для POST batch операций'
      },
      registeredControllers,
      availableProcedures,
      routerInfo: {
        totalProcedures: availableProcedures.length,
        introspection: routerInfo,
        proceduresByRouter: this.groupProceduresByRouter(availableProcedures)
      },
      batchExamples: {
        postBatch: {
          url: 'POST /trpc',
          body: {
            "0": { "procedure": "users.getAll", "input": {} },
            "1": { "procedure": "posts.getAll", "input": {} }
          }
        },
        getBatch: {
          url: 'GET /trpc/users.getAll,posts.getAll?batch=1&input={"0":{"json":{"id":1}},"1":{"json":{"id":2}}}',
          description: 'GET batch запрос'
        }
      }
    };
  }

  /**
   * Получение информации о роутере через интроспекцию
   */
  private getRouterIntrospectionInfo() {
    try {
      const mainRouter = this.autoRouterService.getMainRouter();
      
      if (!mainRouter) {
        return { status: 'no_router', message: 'Main router not available' };
      }

      const info: any = {
        status: 'available',
        hasMainRouter: true,
        structure: {}
      };

      if (mainRouter._def) {
        info.structure.hasProcedures = !!mainRouter._def.procedures;
        info.structure.hasSubRouters = !!mainRouter._def.router;
        
        if (mainRouter._def.procedures) {
          const procedures = mainRouter._def.procedures;
          if (procedures instanceof Map) {
            info.structure.mainProceduresCount = procedures.size;
          } else if (typeof procedures === 'object') {
            info.structure.mainProceduresCount = Object.keys(procedures).length;
          }
        }

        if (mainRouter._def.router && typeof mainRouter._def.router === 'object') {
          const subRouters = mainRouter._def.router;
          info.structure.subRoutersCount = Object.keys(subRouters).length;
          info.structure.subRouterNames = Object.keys(subRouters);
        }
      }

      return info;
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Failed to introspect router',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Группировка процедур по роутерам
   */
  private groupProceduresByRouter(procedures: string[]) {
    const grouped: Record<string, string[]> = {};
    
    procedures.forEach(procedure => {
      const [routerName, methodName] = procedure.split('.');
      if (routerName && methodName) {
        if (!grouped[routerName]) {
          grouped[routerName] = [];
        }
        grouped[routerName].push(methodName);
      }
    });
    
    return grouped;
  }

  /**
   * Выполнение одиночной tRPC процедуры
   */
  private async executeProcedure(procedure: string, input: any): Promise<any> {
    const [routerName, methodName] = procedure.split('.');
    
    if (!routerName || !methodName) {
      throw new HttpException(
        {
          error: 'Invalid procedure format. Use: routerName.methodName',
          example: 'posts.getAll',
          availableProcedures: this.getAvailableProcedures()
        },
        HttpStatus.BAD_REQUEST
      );
    }

    // Получаем зарегистрированные контроллеры
    const registeredControllers = this.autoRouterService.getRegisteredControllers();
    const controllerInfo = registeredControllers.find(c => c.name === routerName);

    if (!controllerInfo) {
      throw new HttpException(
        {
          error: `Router '${routerName}' not found`,
          available: registeredControllers.map(c => c.name)
        },
        HttpStatus.NOT_FOUND
      );
    }

    // Вызываем метод через AutoRouterService
    return await this.autoRouterService.callProcedure(routerName, methodName, input);
  }

  /**
   * Обработка одной операции в batch запросе
   */
  private async processBatchOperation(key: string, operation: any): Promise<any> {
    if (!operation || typeof operation !== 'object') {
      throw new Error('Invalid operation format');
    }

    const { procedure, input = {} } = operation;

    if (!procedure || typeof procedure !== 'string') {
      throw new Error('Missing or invalid procedure name');
    }

    try {
      const result = await this.executeProcedure(procedure, input);
      return {
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(error.message || 'Procedure execution failed');
    }
  }

  /**
   * Получение списка доступных процедур
   */
  private getAvailableProcedures(): string[] {
    const result = this.extractAvailableProceuresFromRouter();
    return result;
  }

  /**
   * Извлечение списка доступных процедур из реального tRPC роутера через интроспекцию
   */
  private extractAvailableProceuresFromRouter(): string[] {
    try {
      const mainRouter = this.autoRouterService.getMainRouter();
      const procedures: string[] = [];

      if (mainRouter && mainRouter._def && mainRouter._def.procedures) {
        const routerProcedures = mainRouter._def.procedures;
        
        if (routerProcedures instanceof Map) {
          for (const [procedureName] of routerProcedures) {
            procedures.push(procedureName);
          }
        } else if (typeof routerProcedures === 'object') {
          procedures.push(...Object.keys(routerProcedures));
        }
      }

      if (mainRouter && mainRouter._def && mainRouter._def.router) {
        procedures.push(...this.extractProceduresFromSubRouters(mainRouter));
      }

      return procedures.sort();
    } catch (error) {
      this.logger.warn('Failed to extract procedures from router via introspection:', error);
      return this.extractAvailableProceduresStatically();
    }
  }

  /**
   * Извлечение процедур из подроутеров
   */
  private extractProceduresFromSubRouters(router: any): string[] {
    const procedures: string[] = [];
    
    try {
      if (router?._def?.router && typeof router._def.router === 'object') {
        const subRouters = router._def.router;
        
        for (const [routerName, subRouter] of Object.entries(subRouters)) {
          if (subRouter && typeof subRouter === 'object' && (subRouter as any)?._def) {
            const typedSubRouter = subRouter as any;
            if (typedSubRouter._def.procedures) {
              const subProcedures = typedSubRouter._def.procedures;
              
              if (subProcedures instanceof Map) {
                for (const [procedureName] of subProcedures) {
                  procedures.push(`${routerName}.${procedureName}`);
                }
              } else if (typeof subProcedures === 'object') {
                for (const procedureName of Object.keys(subProcedures)) {
                  procedures.push(`${routerName}.${procedureName}`);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.warn('Error extracting procedures from sub-routers:', error);
    }
    
    return procedures;
  }

  /**
   * Статический способ получения процедур (fallback)
   */
  private extractAvailableProceduresStatically(): string[] {
    const registeredControllers = this.autoRouterService.getRegisteredControllers();
    return this.extractAvailableProcedures(registeredControllers);
  }

  /**
   * Извлечение списка доступных процедур из контроллеров (старый метод)
   */
  private extractAvailableProcedures(controllers: any[]): string[] {
    const procedures: string[] = [];
    
    controllers.forEach(controller => {
      const baseProcedures = ['getAll', 'getById', 'create', 'update', 'delete'];
      
      switch (controller.name) {
        case 'users':
          baseProcedures.push('search');
          break;
        case 'posts':
          baseProcedures.push('getByAuthor');
          break;
      }
      
      baseProcedures.forEach(method => {
        procedures.push(`${controller.name}.${method}`);
      });
    });
    
    return procedures;
  }
} 