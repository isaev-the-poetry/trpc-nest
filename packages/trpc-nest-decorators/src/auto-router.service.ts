import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initTRPC } from '@trpc/server';
import { 
  TRPC_ROUTER_METADATA,
  TRPC_PROCEDURE_METADATA,
  TrpcRouterMetadata,
  TrpcProcedureMetadata
} from './types';
import { TrpcRouterService } from './trpc-router.service';
import { setAutoRouterService } from './main-router';

const t = initTRPC.create();

@Injectable()
export class AutoRouterService implements OnModuleInit {
  private mainRouter: any = null;
  private registeredControllers: Map<string, any> = new Map();

  constructor(
    private readonly reflector: Reflector,
    private readonly trpcRouterService: TrpcRouterService
  ) {}

  async onModuleInit() {
    // Register this service instance globally
    setAutoRouterService(this);
    
    // Build initial empty router
    this.buildMainRouter();
  }

  /**
   * Get the automatically generated main tRPC router
   */
  getMainRouter() {
    if (!this.mainRouter) {
      this.buildMainRouter();
    }
    return this.mainRouter;
  }

  /**
   * Register a controller manually
   */
  registerController(controllerClass: Type<any>, instance: any) {
    const metadata: TrpcRouterMetadata = this.reflector.get(
      TRPC_ROUTER_METADATA,
      controllerClass
    );

    if (metadata) {
      const routerName = this.getRouterName(controllerClass, metadata);
      
      // Create procedure to method mapping
      const procedureToMethodMap = this.createProcedureToMethodMap(controllerClass);
      
      this.registeredControllers.set(routerName, {
        class: controllerClass,
        instance,
        metadata,
        procedureToMethodMap
      });

      // Rebuild main router
      this.buildMainRouter();
    }
  }

  private buildMainRouter() {
    const routers: Record<string, any> = {};

    this.registeredControllers.forEach(({ class: controllerClass, instance }, routerName) => {
      try {
        const router = this.trpcRouterService.generateRouter(controllerClass, instance);
        routers[routerName] = router;
      } catch (error: any) {
        console.warn(`Error generating router for ${controllerClass.name}:`, error?.message || error);
      }
    });

    this.mainRouter = Object.keys(routers).length > 0 ? t.router(routers) : t.router({});
  }

  private getRouterName(controllerClass: Type<any>, metadata: TrpcRouterMetadata): string {
    if (metadata.path) {
      return metadata.path;
    }
    
    // Generate name from class name (remove 'Controller' suffix and convert to camelCase)
    let name = controllerClass.name;
    if (name.endsWith('Controller')) {
      name = name.slice(0, -10);
    }
    
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  /**
   * Create mapping from procedure names to method names
   */
  private createProcedureToMethodMap(controllerClass: Type<any>): Map<string, string> {
    const map = new Map<string, string>();
    const methodNames = Object.getOwnPropertyNames(controllerClass.prototype);

    for (const methodName of methodNames) {
      if (methodName === 'constructor') continue;

      const procedureMetadata: TrpcProcedureMetadata = this.reflector.get(
        TRPC_PROCEDURE_METADATA,
        controllerClass.prototype[methodName]
      );

      if (procedureMetadata) {
        map.set(procedureMetadata.path, methodName);
      }
    }

    return map;
  }

  /**
   * Get information about registered controllers
   */
  getRegisteredControllers() {
    return Array.from(this.registeredControllers.entries()).map(([name, { class: controllerClass, metadata }]) => ({
      name,
      className: controllerClass.name,
      prefix: metadata.path
    }));
  }

  /**
   * Call a procedure directly from registered controllers
   */
  async callProcedure(routerName: string, procedureName: string, input: any): Promise<any> {
    const controllerInfo = this.registeredControllers.get(routerName);
    
    if (!controllerInfo) {
      throw new Error(`Router '${routerName}' not found. Available: ${Array.from(this.registeredControllers.keys()).join(', ')}`);
    }

    const { instance, procedureToMethodMap } = controllerInfo;
    const methodName = procedureToMethodMap.get(procedureName);
    
    if (!methodName || !instance || typeof instance[methodName] !== 'function') {
      const availableProcedures = Array.from(procedureToMethodMap.keys());
      throw new Error(`Procedure '${procedureName}' not found in controller '${routerName}'. Available procedures: ${availableProcedures.join(', ')}`);
    }

    try {
      // Call the method with input as parameter
      const result = await instance[methodName](input);
      return result;
    } catch (error: any) {
      throw new Error(`Error calling ${routerName}.${procedureName}: ${error.message || error}`);
    }
  }
} 