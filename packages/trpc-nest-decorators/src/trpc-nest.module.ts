import { Module, DynamicModule, Type } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { TrpcRouterService } from './trpc-router.service';
import { AutoRouterService } from './auto-router.service';
import { TrpcHttpController } from './trpc-http.controller';

export interface TrpcNestModuleOptions {
  controllers?: Type<any>[];
  autoDiscovery?: boolean;
  enableHttpEndpoints?: boolean;
  httpPrefix?: string;
}

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
        {
          provide: 'TRPC_MODULE_OPTIONS',
          useValue: options,
        },
        {
          provide: 'TrpcNestModuleOptions',
          useValue: options,
        },
      ],
      exports: [TrpcRouterService, AutoRouterService],
      global: true,
    };
  }

  static forFeature(options: TrpcNestModuleOptions = {}): DynamicModule {
    return {
      module: TrpcNestModule,
      providers: [
        Reflector,
        TrpcRouterService,
        AutoRouterService
      ],
      exports: [TrpcRouterService, AutoRouterService],
    };
  }
} 