import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initTRPC } from '@trpc/server';
import { observable } from '@trpc/server/observable';
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
   * Generate tRPC router from NestJS controller with tRPC v11 support
   */
  generateRouter(controllerClass: Type<any>, controllerInstance: any) {
    const routerMetadata: TrpcRouterMetadata = this.reflector.get(
      TRPC_ROUTER_METADATA,
      controllerClass
    );

    if (!routerMetadata) {
      throw new Error(`Controller ${controllerClass.name} is not marked with @Router decorator`);
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
        return this.createQueryProcedure(metadata, instance, methodName);
      
      case 'mutation':
        return this.createMutationProcedure(metadata, instance, methodName);
      
      case 'subscription':
        return this.createSubscriptionProcedure(metadata, instance, methodName);
      
      default:
        throw new Error(`Unknown procedure type: ${metadata.type}`);
    }
  }

  private createQueryProcedure(metadata: TrpcProcedureMetadata, instance: any, methodName: string) {
    const queryHandler = async (opts: any) => {
      const result = await instance[methodName](opts?.input);
      
      // tRPC v11 streaming support
      if (metadata.streaming && this.isAsyncIterable(result)) {
        return result;
      }
      
      return result;
    };

    // Build procedure with optional input/output validation
    if (metadata.input && metadata.output) {
      return t.procedure
        .input(metadata.input)
        .output(metadata.output)
        .query(queryHandler);
    } else if (metadata.input) {
      return t.procedure
        .input(metadata.input)
        .query(queryHandler);
    } else if (metadata.output) {
      return t.procedure
        .output(metadata.output)
        .query(queryHandler);
    } else {
      return t.procedure.query(queryHandler);
    }
  }

  private createMutationProcedure(metadata: TrpcProcedureMetadata, instance: any, methodName: string) {
    const mutationHandler = async (opts: any) => {
      let input = opts?.input;
      
      // Handle different content types for tRPC v11
      if (metadata.contentType) {
        input = this.processContentType(input, metadata.contentType);
      }
      
      const result = await instance[methodName](input);
      
      // Support streaming mutations
      if (metadata.streaming && this.isAsyncIterable(result)) {
        return result;
      }
      
      return result;
    };

    // Build procedure with optional input/output validation
    if (metadata.input && metadata.output) {
      return t.procedure
        .input(metadata.input)
        .output(metadata.output)
        .mutation(mutationHandler);
    } else if (metadata.input) {
      return t.procedure
        .input(metadata.input)
        .mutation(mutationHandler);
    } else if (metadata.output) {
      return t.procedure
        .output(metadata.output)
        .mutation(mutationHandler);
    } else {
      return t.procedure.mutation(mutationHandler);
    }
  }

  private createSubscriptionProcedure(metadata: TrpcProcedureMetadata, instance: any, methodName: string) {
    const subscriptionHandler = (opts: any) => {
      return observable((emit) => {
        const handleSubscription = async () => {
          try {
            const result = await instance[methodName](opts?.input);
            
            // Handle different subscription types
            if (this.isAsyncIterable(result)) {
              // Handle async iterables (generators)
              for await (const value of result) {
                emit.next(value);
              }
            } else if (typeof result === 'function') {
              // Handle callback-based subscriptions
              result((data: any) => emit.next(data));
            } else {
              // Single value
              emit.next(result);
            }
            
            emit.complete();
          } catch (error) {
            emit.error(error);
          }
        };

        handleSubscription();

        // Cleanup function
        return () => {
          // Handle cleanup if needed
        };
      });
    };

    // Build procedure with optional input/output validation
    if (metadata.input && metadata.output) {
      return t.procedure
        .input(metadata.input)
        .output(metadata.output)
        .subscription(subscriptionHandler);
    } else if (metadata.input) {
      return t.procedure
        .input(metadata.input)
        .subscription(subscriptionHandler);
    } else if (metadata.output) {
      return t.procedure
        .output(metadata.output)
        .subscription(subscriptionHandler);
    } else {
      return t.procedure.subscription(subscriptionHandler);
    }
  }

  /**
   * Process different content types for tRPC v11
   */
  private processContentType(input: any, contentType: string) {
    switch (contentType) {
      case 'formdata':
        // Handle FormData input
        if (input instanceof FormData) {
          return input;
        }
        break;
      
      case 'octet-stream':
        // Handle binary data (Blob, File, Uint8Array, ReadableStream)
        if (input instanceof Blob || 
            input instanceof File || 
            input instanceof Uint8Array ||
            input instanceof ReadableStream) {
          return input;
        }
        break;
      
      case 'text':
        // Handle plain text
        return String(input);
      
      case 'json':
      default:
        return input;
    }
    
    return input;
  }

  /**
   * Check if value is async iterable (for streaming support)
   */
  private isAsyncIterable(value: any): value is AsyncIterable<any> {
    return value != null && typeof value[Symbol.asyncIterator] === 'function';
  }

  /**
   * Get all controllers marked with @Router from a module
   */
  getTrpcControllers(controllers: Type<any>[]): Type<any>[] {
    return controllers.filter(controller => {
      const metadata = this.reflector.get(TRPC_ROUTER_METADATA, controller);
      return !!metadata;
    });
  }
} 