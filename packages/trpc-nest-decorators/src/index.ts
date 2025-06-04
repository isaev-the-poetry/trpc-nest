// Decorators
export * from './decorators';

// Types
export * from './types';

// Services
export * from './trpc-router.service';
export * from './auto-router.service';

// Module
export * from './trpc-nest.module';

// Convenience functions for auto router
export { createMainRouter, getRegisteredControllers } from './main-router';

// New TrpcHttpController
export * from './trpc-http.controller'; 