import { Inject } from '@nestjs/common';
import { TrpcRouterProvider } from './trpc-router-provider.service';

/**
 * Декоратор для инъекции TrpcRouterProvider в любой сервис или контроллер
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class AppService {
 *   constructor(@InjectTrpcRouter() private trpcRouter: TrpcRouterProvider) {}
 * 
 *   getAppRouter() {
 *     return this.trpcRouter.getMainRouter();
 *   }
 * }
 * ```
 */
export const InjectTrpcRouter = () => Inject(TrpcRouterProvider);

/**
 * Функция-декоратор для создания метода, который возвращает главный роутер
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class AppService {
 *   @AppRouter()
 *   getAppRouter() {
 *     // Этот метод автоматически вернет главный tRPC роутер
 *   }
 * }
 * ```
 */
export function AppRouter() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // Получаем TrpcRouterProvider из инъекции зависимостей
      const trpcRouter = (this as any).trpcRouter || (this as any).trpcRouterProvider;
      
      if (trpcRouter && typeof trpcRouter.getMainRouter === 'function') {
        return trpcRouter.getMainRouter();
      }
      
      // Если провайдер не найден, возвращаем результат оригинального метода
      return originalMethod?.apply(this, args);
    };
    
    return descriptor;
  };
} 