import { SetMetadata, applyDecorators } from '@nestjs/common';
import { 
  TRPC_ROUTER_METADATA, 
  TRPC_PROCEDURE_METADATA, 
  TrpcControllerOptions, 
  TrpcProcedureOptions,
  StreamingOptions,
  SSESubscriptionOptions
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
 * Supports tRPC v11 shorthand router definitions
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
 * Supports tRPC v11 streaming responses
 */
export function Query(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'query',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output,
      streaming: options.streaming,
      contentType: options.contentType || 'json'
    })(target, propertyKey, descriptor);
  };
}

/**
 * Decorator to mark a method as a tRPC mutation procedure
 * Supports tRPC v11 FormData and non-JSON content types
 */
export function Mutation(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'mutation',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output,
      streaming: options.streaming,
      contentType: options.contentType || 'json'
    })(target, propertyKey, descriptor);
  };
}

/**
 * Decorator to mark a method as a tRPC subscription procedure
 * Supports tRPC v11 Server-Sent Events and improved subscriptions
 */
export function Subscription(path?: string, options: TrpcProcedureOptions = {}): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const procedurePath = path || String(propertyKey);
    
    SetMetadata(TRPC_PROCEDURE_METADATA, {
      type: 'subscription',
      path: procedurePath,
      method: String(propertyKey),
      input: options.input,
      output: options.output,
      serverSentEvents: options.serverSentEvents || false
    })(target, propertyKey, descriptor);
  };
}

/**
 * tRPC v11 specific decorators for new content types
 */

/**
 * Decorator for FormData procedures
 */
export function FormDataMutation(path?: string, options: Omit<TrpcProcedureOptions, 'contentType'> = {}): MethodDecorator {
  return Mutation(path, { ...options, contentType: 'formdata' });
}

/**
 * Decorator for binary/octet-stream procedures
 */
export function BinaryMutation(path?: string, options: Omit<TrpcProcedureOptions, 'contentType'> = {}): MethodDecorator {
  return Mutation(path, { ...options, contentType: 'octet-stream' });
}

/**
 * Decorator for streaming queries
 */
export function StreamingQuery(path?: string, options: Omit<TrpcProcedureOptions, 'streaming'> = {}): MethodDecorator {
  return Query(path, { ...options, streaming: true });
}

/**
 * Decorator for Server-Sent Events subscriptions
 */
export function SSESubscription(path?: string, options: Omit<TrpcProcedureOptions, 'serverSentEvents'> = {}): MethodDecorator {
  return Subscription(path, { ...options, serverSentEvents: true });
}

// Backward compatibility - keep old names as aliases
export const TrpcRouter = Router;
export const TrpcQuery = Query;
export const TrpcMutation = Mutation;
export const TrpcSubscription = Subscription;

// Additional alias for clarity
export const TrpcController = Router; 