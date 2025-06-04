import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initTRPC } from '@trpc/server';
import { 
  TRPC_ROUTER_METADATA, 
  TRPC_PROCEDURE_METADATA, 
  TrpcRouterMetadata, 
  TrpcProcedureMetadata 
} from './types';

const t = initTRPC.create();

@Injectable()
export class TrpcRouterService {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Generate tRPC router from NestJS controller
   */
  generateRouter(controllerClass: Type<any>, controllerInstance: any) {
    const routerMetadata: TrpcRouterMetadata = this.reflector.get(
      TRPC_ROUTER_METADATA,
      controllerClass
    );

    if (!routerMetadata) {
      throw new Error(`Controller ${controllerClass.name} is not marked with @TrpcRouter decorator`);
    }

    const procedures: Record<string, any> = {};
    const methodNames = Object.getOwnPropertyNames(controllerClass.prototype);

    for (const methodName of methodNames) {
      if (methodName === 'constructor') continue;

      const procedureMetadata: TrpcProcedureMetadata = this.reflector.get(
        TRPC_PROCEDURE_METADATA,
        controllerClass.prototype[methodName]
      );

      if (procedureMetadata) {
        const procedure = this.createProcedure(
          procedureMetadata,
          controllerInstance,
          methodName
        );
        
        procedures[procedureMetadata.path] = procedure;
      }
    }

    return t.router(procedures);
  }

  private createProcedure(
    metadata: TrpcProcedureMetadata,
    instance: any,
    methodName: string
  ) {
    // Create procedure based on type
    switch (metadata.type) {
      case 'query':
        if (metadata.input) {
          return t.procedure
            .input(metadata.input)
            .query(async (opts: any) => {
              return await instance[methodName](opts.input);
            });
        } else {
          return t.procedure.query(async () => {
            return await instance[methodName]();
          });
        }
      
      case 'mutation':
        if (metadata.input) {
          return t.procedure
            .input(metadata.input)
            .mutation(async (opts: any) => {
              return await instance[methodName](opts.input);
            });
        } else {
          return t.procedure.mutation(async () => {
            return await instance[methodName]();
          });
        }
      
      case 'subscription':
        if (metadata.input) {
          return t.procedure
            .input(metadata.input)
            .subscription(async (opts: any) => {
              return await instance[methodName](opts.input);
            });
        } else {
          return t.procedure.subscription(async () => {
            return await instance[methodName]();
          });
        }
      
      default:
        throw new Error(`Unknown procedure type: ${metadata.type}`);
    }
  }

  /**
   * Get all controllers marked with @TrpcRouter from a module
   */
  getTrpcControllers(controllers: Type<any>[]): Type<any>[] {
    return controllers.filter(controller => {
      const metadata = this.reflector.get(TRPC_ROUTER_METADATA, controller);
      return !!metadata;
    });
  }
} 