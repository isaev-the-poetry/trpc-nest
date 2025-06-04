import { Injectable, OnModuleInit, OnApplicationBootstrap, Type, Inject, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { initTRPC } from '@trpc/server';
import { 
  TRPC_ROUTER_METADATA,
  TRPC_PROCEDURE_METADATA,
  TrpcRouterMetadata,
  TrpcProcedureMetadata
} from './types';
import { TrpcRouterService } from './trpc-router.service';
import { setAutoRouterService } from './main-router';
import { getGlobalControllerRegistry } from './decorators';

const t = initTRPC.create();

interface TrpcModuleOptions {
  autoDiscovery?: boolean;
}

@Injectable()
export class AutoRouterService implements OnModuleInit, OnApplicationBootstrap {
  private mainRouter: any = null;
  private registeredControllers: Map<string, any> = new Map();
  private autoDiscoveryEnabled: boolean = false;

  constructor(
    private readonly reflector: Reflector,
    private readonly trpcRouterService: TrpcRouterService,
    @Optional() @Inject('TRPC_MODULE_OPTIONS') private readonly options?: TrpcModuleOptions
  ) {
    // Enable auto-discovery if specified in options
    if (this.options?.autoDiscovery) {
      console.log('Auto-discovery enabled from module options');
      this.autoDiscoveryEnabled = true;
    }
  }

  async onModuleInit() {
    // Register this service instance globally
    setAutoRouterService(this);
    
    // Build initial router
    this.buildMainRouter();
  }

  async onApplicationBootstrap() {
    console.log(`onApplicationBootstrap called, autoDiscoveryEnabled: ${this.autoDiscoveryEnabled}`);
    // Perform auto-discovery after all modules are fully initialized
    if (this.autoDiscoveryEnabled) {
      console.log('Starting tRPC controller auto-discovery...');
      await this.performAutoDiscovery();
      // Rebuild router after discovery
      this.buildMainRouter();
    } else {
      console.log('Auto-discovery is disabled');
    }
  }

  /**
   * Enable auto-discovery of tRPC controllers
   */
  enableAutoDiscovery() {
    console.log('Auto-discovery enabled for tRPC controllers');
    this.autoDiscoveryEnabled = true;
  }

  /**
   * Perform automatic discovery of tRPC controllers
   */
  private async performAutoDiscovery() {
    try {
      const globalRegistry = getGlobalControllerRegistry();
      console.log(`Found ${globalRegistry.size} tRPC controllers in global registry`);
      
      for (const [controllerClass, registryEntry] of globalRegistry) {
        await this.checkAndRegisterController(controllerClass, registryEntry);
      }
      
      console.log(`Auto-discovery completed. Found ${this.registeredControllers.size} tRPC controllers.`);
    } catch (error: any) {
      console.warn('Error during auto-discovery:', error?.message || error);
    }
  }

  /**
   * Check if a controller is a tRPC controller and register it
   */
  private async checkAndRegisterController(controllerClass: any, registryEntry: any) {
    try {
      if (!controllerClass || !registryEntry) {
        return;
      }

      // Check if the class has tRPC router metadata
      const metadata: TrpcRouterMetadata = this.reflector.get(
        TRPC_ROUTER_METADATA,
        controllerClass
      );

      if (metadata) {
        const routerName = this.getRouterName(controllerClass, metadata);
        
        // Skip if already registered
        if (this.registeredControllers.has(routerName)) {
          return;
        }

        // For now, we'll create a dummy instance if none exists
        // In a real implementation, we'd need to get the actual instance from NestJS DI
        const instance = registryEntry.instance || new controllerClass();

        // Create procedure to method mapping
        const procedureToMethodMap = this.createProcedureToMethodMap(controllerClass);
        
        this.registeredControllers.set(routerName, {
          class: controllerClass,
          instance,
          metadata,
          procedureToMethodMap
        });

        console.log(`Auto-registered tRPC controller: ${controllerClass.name} as '${routerName}'`);
      }
    } catch (error: any) {
      console.warn('Error checking controller for tRPC registration:', error?.message || error);
    }
  }

  /**
   * Get the automatically generated main tRPC router
   */
  getMainRouter() {
    if (!this.mainRouter) {
      this.buildMainRouter();
    }
    return this.mainRouter;
  }

  /**
   * Register a controller manually
   */
  registerController(controllerClass: Type<any>, instance: any) {
    const metadata: TrpcRouterMetadata = this.reflector.get(
      TRPC_ROUTER_METADATA,
      controllerClass
    );

    if (metadata) {
      const routerName = this.getRouterName(controllerClass, metadata);
      
      // Create procedure to method mapping
      const procedureToMethodMap = this.createProcedureToMethodMap(controllerClass);
      
      this.registeredControllers.set(routerName, {
        class: controllerClass,
        instance,
        metadata,
        procedureToMethodMap
      });

      // Rebuild main router
      this.buildMainRouter();
    }
  }

  private buildMainRouter() {
    const routers: Record<string, any> = {};

    this.registeredControllers.forEach(({ class: controllerClass, instance }, routerName) => {
      try {
        const router = this.trpcRouterService.generateRouter(controllerClass, instance);
        routers[routerName] = router;
      } catch (error: any) {
        console.warn(`Error generating router for ${controllerClass.name}:`, error?.message || error);
      }
    });

    this.mainRouter = Object.keys(routers).length > 0 ? t.router(routers) : t.router({});
  }

  private getRouterName(controllerClass: Type<any>, metadata: TrpcRouterMetadata): string {
    if (metadata.path) {
      return metadata.path;
    }
    
    // Generate name from class name (remove 'Controller' suffix and convert to camelCase)
    let name = controllerClass.name;
    if (name.endsWith('Controller')) {
      name = name.slice(0, -10);
    }
    
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  /**
   * Create mapping from procedure names to method names
   */
  private createProcedureToMethodMap(controllerClass: Type<any>): Map<string, string> {
    const map = new Map<string, string>();
    const methodNames = Object.getOwnPropertyNames(controllerClass.prototype);

    for (const methodName of methodNames) {
      if (methodName === 'constructor') continue;

      const procedureMetadata: TrpcProcedureMetadata = this.reflector.get(
        TRPC_PROCEDURE_METADATA,
        controllerClass.prototype[methodName]
      );

      if (procedureMetadata) {
        map.set(procedureMetadata.path, methodName);
      }
    }

    return map;
  }

  /**
   * Get information about registered controllers
   */
  getRegisteredControllers() {
    return Array.from(this.registeredControllers.entries()).map(([name, { class: controllerClass, metadata }]) => ({
      name,
      className: controllerClass.name,
      prefix: metadata.path
    }));
  }

  /**
   * Call a procedure directly from registered controllers
   */
  async callProcedure(routerName: string, procedureName: string, input: any): Promise<any> {
    const controllerInfo = this.registeredControllers.get(routerName);
    
    if (!controllerInfo) {
      throw new Error(`Router '${routerName}' not found. Available: ${Array.from(this.registeredControllers.keys()).join(', ')}`);
    }

    const { instance, procedureToMethodMap } = controllerInfo;
    const methodName = procedureToMethodMap.get(procedureName);
    
    if (!methodName || !instance || typeof instance[methodName] !== 'function') {
      const availableProcedures = Array.from(procedureToMethodMap.keys());
      throw new Error(`Procedure '${procedureName}' not found in controller '${routerName}'. Available procedures: ${availableProcedures.join(', ')}`);
    }

    try {
      // Call the method with input as parameter
      const result = await instance[methodName](input);
      return result;
    } catch (error: any) {
      throw new Error(`Error calling ${routerName}.${procedureName}: ${error.message || error}`);
    }
  }
} 