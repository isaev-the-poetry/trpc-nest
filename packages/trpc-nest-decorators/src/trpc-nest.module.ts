import { Module, DynamicModule, Type } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { TrpcRouterService } from './trpc-router.service';
import { AutoRouterService } from './auto-router.service';
import { TrpcHttpController } from './trpc-http.controller';
import { TrpcRouterProvider } from './trpc-router-provider.service';

export interface TrpcNestModuleOptions {
  controllers?: Type<any>[];
  autoDiscovery?: boolean;
  enableHttpEndpoints?: boolean;
  httpPrefix?: string;
}

// Token for injecting the main router
export const MAIN_TRPC_ROUTER = Symbol('MAIN_TRPC_ROUTER');

@Module({})
export class TrpcNestModule {
  static forRoot(options: TrpcNestModuleOptions = {}): DynamicModule {
    const { enableHttpEndpoints = true, autoDiscovery = false } = options;

    return {
      module: TrpcNestModule,
      controllers: enableHttpEndpoints ? [TrpcHttpController] : [],
      providers: [
        Reflector,
        TrpcRouterService,
        AutoRouterService,
        TrpcRouterProvider,
        {
          provide: 'TRPC_MODULE_OPTIONS',
          useValue: options,
        },
        {
          provide: 'TrpcNestModuleOptions',
          useValue: options,
        },
        // Provider for the main router - created after AutoRouterService initialization
        {
          provide: MAIN_TRPC_ROUTER,
          useFactory: (autoRouterService: AutoRouterService) => {
            return () => autoRouterService.getMainRouter();
          },
          inject: [AutoRouterService],
        },
      ],
      exports: [TrpcRouterService, AutoRouterService, MAIN_TRPC_ROUTER, TrpcRouterProvider],
      global: true,
    };
  }

  static forFeature(options: TrpcNestModuleOptions = {}): DynamicModule {
    return {
      module: TrpcNestModule,
      providers: [
        Reflector,
        TrpcRouterService,
        AutoRouterService,
        TrpcRouterProvider,
        {
          provide: MAIN_TRPC_ROUTER,
          useFactory: (autoRouterService: AutoRouterService) => {
            return () => autoRouterService.getMainRouter();
          },
          inject: [AutoRouterService],
        },
      ],
      exports: [TrpcRouterService, AutoRouterService, MAIN_TRPC_ROUTER, TrpcRouterProvider],
    };
  }
} 