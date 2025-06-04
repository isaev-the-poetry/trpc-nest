import { SetMetadata, applyDecorators } from '@nestjs/common';
import { 
  TRPC_ROUTER_METADATA, 
  TRPC_PROCEDURE_METADATA, 
  TrpcControllerOptions, 
  TrpcProcedureOptions 
} from './types';

// Global registry for tRPC controllers
const globalControllerRegistry = new Map<any, { metadata: any, instance?: any }>();

/**
 * Get all registered tRPC controllers
 */
export function getGlobalControllerRegistry() {
  return globalControllerRegistry;
}

/**
 * Register a controller instance in the global registry
 */
export function registerControllerInstance(controllerClass: any, instance: any) {
  const existing = globalControllerRegistry.get(controllerClass);
  if (existing) {
    existing.instance = instance;
  }
}

/**
 * Decorator to mark a NestJS controller as a tRPC router
 */
export function Router(options: TrpcControllerOptions = {}): ClassDecorator {
  return (target: any) => {
    const metadata = {
      path: options.prefix || '',
      procedures: new Map()
    };
    
    // Register in global registry
    globalControllerRegistry.set(target, { metadata });
    
    // Apply NestJS metadata
    SetMetadata(TRPC_ROUTER_METADATA, metadata)(target);
  };
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

// Additional alias for clarity
export const TrpcController = Router; 