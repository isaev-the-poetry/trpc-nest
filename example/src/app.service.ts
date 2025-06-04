import { Injectable } from '@nestjs/common';
import { createMainRouter, getRegisteredControllers, AutoRouterService } from 'trpc-nest-decorators';
import { UsersController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';

@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController,
    private readonly postsController: PostsController
  ) {
    // Регистрация контроллеров теперь происходит автоматически
    // В будущих версиях планируется автоматическое обнаружение
    // this.autoRouterService.registerController(UsersController, this.usersController);
    // this.autoRouterService.registerController(PostsController, this.postsController);
  }

  /**
   * Получает автоматически созданный главный tRPC роутер
   */
  getTrpcRouter() {
    return createMainRouter();
  }

  /**
   * Информация о приложении
   */
  getInfo() {
    const registeredControllers = getRegisteredControllers();

    return {
      name: "tRPC NestJS Example",
      version: "1.0.0",
      description:
        "Example application using trpc-nest-decorators with automatic HTTP endpoints",
      message:
        "tRPC HTTP endpoints are now automatically provided by the package",
      note: "Controller registration is now automatic using auto-discovery",
      automaticEndpoints: {
        info: "GET /api/trpc",
        single: "POST /api/trpc/:procedure",
        get: "GET /api/trpc/:procedure?input=encodedJSON",
        batch: "POST /api/trpc",
      },
      registeredControllers,
    };
  }
} 