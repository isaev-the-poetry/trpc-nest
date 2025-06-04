import { AutoRouterService } from './auto-router.service';

let autoRouterServiceInstance: AutoRouterService | null = null;

/**
 * Set the AutoRouterService instance (used internally by the module)
 */
export function setAutoRouterService(service: AutoRouterService) {
  autoRouterServiceInstance = service;
}

/**
 * Get the automatically generated main tRPC router
 * This function can be called from anywhere after the module initialization
 */
export function createMainRouter() {
  if (!autoRouterServiceInstance) {
    throw new Error('AutoRouterService not initialized. Make sure TrpcNestModule is imported in your app module.');
  }
  
  return autoRouterServiceInstance.getMainRouter();
}

/**
 * Get information about registered controllers
 */
export function getRegisteredControllers() {
  if (!autoRouterServiceInstance) {
    throw new Error('AutoRouterService not initialized. Make sure TrpcNestModule is imported in your app module.');
  }
  
  return autoRouterServiceInstance.getRegisteredControllers();
} 