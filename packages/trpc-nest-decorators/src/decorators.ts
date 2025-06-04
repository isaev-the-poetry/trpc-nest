import { SetMetadata, applyDecorators } from '@nestjs/common';
import { 
  TRPC_ROUTER_METADATA, 
  TRPC_PROCEDURE_METADATA, 
  TrpcControllerOptions, 
  TrpcProcedureOptions 
} from './types';

/**
 * Decorator to mark a NestJS controller as a tRPC router
 */
export function Router(options: TrpcControllerOptions = {}): ClassDecorator {
  return applyDecorators(
    SetMetadata(TRPC_ROUTER_METADATA, {
      path: options.prefix || '',
      procedures: new Map()
    })
  );
}

/**
 * Decorator to mark a method as a tRPC query procedure
 */
export function Query(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'query',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output
    })(target, propertyKey, descriptor);
  };
}

/**
 * Decorator to mark a method as a tRPC mutation procedure
 */
export function Mutation(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'mutation',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output
    })(target, propertyKey, descriptor);
  };
}

/**
 * Decorator to mark a method as a tRPC subscription procedure
 */
export function Subscription(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'subscription',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output
    })(target, propertyKey, descriptor);
  };
}

// Backward compatibility - keep old names as aliases
export const TrpcRouter = Router;
export const TrpcQuery = Query;
export const TrpcMutation = Mutation;
export const TrpcSubscription = Subscription; 