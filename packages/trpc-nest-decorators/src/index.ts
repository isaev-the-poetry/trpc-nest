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

// HTTP Controller
export * from './trpc-http.controller';

// tRPC v11 utilities and helpers
export * from './trpc-v11-utils'; 