import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AutoRouterService } from './auto-router.service';

@Injectable()
export class TrpcRouterProvider implements OnApplicationBootstrap {
  private mainRouter: any = null;

  constructor(private readonly autoRouterService: AutoRouterService) {}

  async onApplicationBootstrap() {
    // Получаем главный роутер после полной инициализации всех модулей
    setTimeout(() => {
      this.mainRouter = this.autoRouterService.getMainRouter();
    }, 100); // Небольшая задержка для гарантии полной инициализации
  }

  /**
   * Получить главный tRPC роутер
   * Этот метод может быть вызван из любого места после инициализации модуля
   */
  getMainRouter() {
    if (!this.mainRouter) {
      this.mainRouter = this.autoRouterService.getMainRouter();
    }
    return this.mainRouter;
  }

  /**
   * Получить информацию о зарегистрированных контроллерах
   */
  getRegisteredControllers() {
    return this.autoRouterService.getRegisteredControllers();
  }

  /**
   * Принудительное обновление главного роутера
   * Полезно, если контроллеры были добавлены динамически
   */
  refreshMainRouter() {
    this.mainRouter = this.autoRouterService.getMainRouter();
    return this.mainRouter;
  }
} 