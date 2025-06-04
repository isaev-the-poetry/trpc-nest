# tRPC NestJS Decorators

🚀 Расширение функционала NestJS для создания tRPC роутеров с помощью декораторов.

## Описание проекта

Этот проект содержит npm пакет `trpc-nest-decorators`, который позволяет легко интегрировать tRPC в NestJS приложения используя декораторы. Пакет предоставляет простой способ преобразования обычных NestJS контроллеров в tRPC роутеры с автоматической генерацией главного роутера.

## Структура проекта

```
trpc-nest-decorators/
├── packages/
│   └── trpc-nest-decorators/    # Основной npm пакет
│       ├── src/
│       │   ├── decorators.ts     # Декораторы (@Router, @Query, @Mutation)
│       │   ├── types.ts          # TypeScript типы и интерфейсы
│       │   ├── trpc-router.service.ts  # Сервис для генерации tRPC роутеров
│       │   ├── auto-router.service.ts  # Автоматический роутер
│       │   ├── trpc-nest.module.ts     # NestJS модуль
│       │   ├── main-router.ts    # Утилитные функции
│       │   └── index.ts          # Экспорт публичного API
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
└── example/                     # Тестовое NestJS приложение
    ├── src/
    │   ├── users/               # Пример контроллера пользователей
    │   ├── posts/               # Пример контроллера постов
    │   ├── app.controller.ts    # Демо endpoints
    │   ├── app.service.ts       # Сервис с автоматическим роутером
    │   ├── app.module.ts        # Главный модуль
    │   └── main.ts              # Точка входа
    ├── package.json
    └── README.md
```

## Возможности пакета

### ✨ Основные функции

- **Короткие декораторы**: `@Router`, `@Query`, `@Mutation`, `@Subscription`
- **Автоматическая генерация роутеров**: преобразование NestJS контроллеров в tRPC роутеры
- **Автоматический главный роутер**: объединение всех контроллеров в один роутер
- **Валидация данных**: интеграция с Zod для входных и выходных данных
- **Dependency Injection**: полная поддержка DI системы NestJS
- **TypeScript поддержка**: полная типизация для безопасности типов
- **Обратная совместимость**: старые декораторы с префиксом `Trpc` все еще работают

### 🎯 Преимущества

- **Простота использования**: знакомый синтаксис декораторов NestJS
- **Минимальная настройка**: легко подключается к существующим проектам
- **Автоматизация**: не нужно вручную создавать и объединять роутеры
- **Гибкость**: сохраняет все возможности NestJS и tRPC
- **Производительность**: эффективная генерация роутеров

## Быстрый старт

### 1. Сборка пакета

```bash
cd packages/trpc-nest-decorators
npm install
npm run build
```

### 2. Запуск примера

```bash
cd example
npm install
npm run build
npm start
```

### 3. Тестирование

Откройте браузер и переходите по адресам:
- http://localhost:3000/api - информация о приложении
- http://localhost:3000/api/trpc-schema - схема tRPC роутера

## Использование в вашем проекте

### Установка

```bash
npm install trpc-nest-decorators @trpc/server zod
```

### Создание контроллера

```typescript
import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() {
    return [{ id: 1, name: 'John' }];
  }

  @Mutation('create', {
    input: z.object({ name: z.string().min(1) })
  })
  async createUser(input: { name: string }) {
    return { id: Date.now(), name: input.name };
  }
}
```

### Подключение модуля

```typescript
import { Module } from '@nestjs/common';
import { TrpcNestModule } from 'trpc-nest-decorators';

@Module({
  imports: [TrpcNestModule.forRoot()],
  // ... остальные настройки
})
export class AppModule {}
```

### Автоматический роутер

```typescript
import { Injectable } from '@nestjs/common';
import { createMainRouter, AutoRouterService } from 'trpc-nest-decorators';

@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController
  ) {
    // Регистрируем контроллер
    this.autoRouterService.registerController(UsersController, this.usersController);
  }

  getTrpcRouter() {
    // Получаем автоматически созданный роутер
    return createMainRouter();
  }
}
```

## Доступные декораторы

### `@Router(options?)`
Помечает класс как tRPC роутер
- `options.prefix` - префикс для всех процедур

### `@Query(path?, options?)`
Создает tRPC query процедуру
- `path` - путь процедуры (опционально)
- `options.input` - схема валидации входных данных
- `options.output` - схема валидации выходных данных

### `@Mutation(path?, options?)`
Создает tRPC mutation процедуру

### `@Subscription(path?, options?)`
Создает tRPC subscription процедуру

## Утилитные функции

### `createMainRouter()`
Возвращает автоматически созданный главный tRPC роутер

### `getRegisteredControllers()`
Возвращает информацию о зарегистрированных контроллерах

## Примеры

В папке `example/` вы найдете полный рабочий пример с:
- Контроллерами пользователей и постов
- Валидацией данных через Zod
- Различными типами tRPC процедур
- Автоматической генерацией главного роутера
- Полной интеграцией с NestJS DI

## Обратная совместимость

Старые декораторы с префиксом `Trpc` все еще поддерживаются:

```typescript
// Старый синтаксис (все еще работает)
import { TrpcRouter, TrpcQuery, TrpcMutation } from 'trpc-nest-decorators';

// Новый синтаксис (рекомендуется)
import { Router, Query, Mutation } from 'trpc-nest-decorators';
```

## Планы развития

- [x] Короткие декораторы без префикса
- [x] Автоматический главный роутер
- [ ] HTTP adapter интеграция
- [ ] Middleware поддержка
- [ ] Аутентификация и авторизация
- [ ] Расширенная типизация
- [ ] Документация API
- [ ] Тесты

## Лицензия

MIT

## Вклад в проект

Мы рады вашему участию! Создавайте issues и pull requests.

---

**Примечание**: Этот пакет находится в стадии разработки. Для production использования рекомендуется дополнительное тестирование и настройка. 