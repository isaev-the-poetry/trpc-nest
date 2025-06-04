import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('trpc-schema')
  getTrpcSchema() {
    const router = this.appService.getTrpcRouter();
    
    return {
      message: 'tRPC Router Schema (via example app)',
      note: 'tRPC HTTP endpoints are now automatically provided by trpc-nest-decorators package',
      automaticEndpoints: {
        single: 'POST /trpc/:procedure - для одиночных операций',
        get: 'GET /trpc/:procedure?input=encodedJSON - для query операций',
        batch: 'POST /trpc - для batch операций',
        info: 'GET /trpc - информация о доступных процедурах'
      },
      router: this.extractRouterInfo(router)
    };
  }

  private extractRouterInfo(router: any): any {
    try {
      if (router && typeof router === 'object') {
        const info: any = {
          type: 'tRPC Router',
          hasRouters: false,
          routers: []
        };

        if (router._def) {
          if (router._def.procedures) {
            info.hasRouters = true;
            info.procedures = Array.from(router._def.procedures.keys ? router._def.procedures.keys() : []);
          }
          if (router._def.router) {
            info.routerType = router._def.router;
          }
        }

        return info;
      }
      
      return { message: 'Router information not available' };
    } catch (error: any) {
      return { error: 'Failed to extract router info', message: error.message };
    }
  }
} 