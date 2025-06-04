# tRPC NestJS Decorators

🚀 Расширение функционала NestJS для создания tRPC роутеров с помощью декораторов с поддержкой **tRPC v11**.

## Описание проекта

Этот проект содержит npm пакет `trpc-nest-decorators`, который позволяет легко интегрировать tRPC v11 в NestJS приложения используя декораторы. Пакет предоставляет простой способ преобразования обычных NestJS контроллеров в tRPC роутеры с автоматической генерацией главного роутера и поддержкой всех новых возможностей tRPC v11.

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
- [x] **tRPC v11 поддержка**
- [x] **FormData / Non-JSON Content Types**
- [x] **Streaming Responses**
- [x] **Server-Sent Events Subscriptions**
- [x] **Улучшенные subscriptions с generators**
- [x] **Shorthand Router Definitions**
- [ ] HTTP adapter интеграция
- [ ] Middleware поддержка
- [ ] Аутентификация и авторизация
- [ ] Расширенная типизация
- [ ] Документация API
- [ ] Тесты
- [ ] **TanStack Query v5 интеграция**
- [ ] **React Server Components поддержка**

## Лицензия

MIT

## Вклад в проект

Мы рады вашему участию! Создавайте issues и pull requests.

---

**Примечание**: Этот пакет находится в стадии разработки. Для production использования рекомендуется дополнительное тестирование и настройка.

## 🆕 Новые возможности tRPC v11

### FormData / Non-JSON Content Types Support

Поддержка различных типов контента, включая `FormData`, `Blob`, `File`, `Uint8Array`, и `ReadableStream`:

```typescript
import { FormDataMutation, BinaryMutation, formDataParser, octetInputParser } from 'trpc-nest-decorators';

@Router({ prefix: 'upload' })
export class UploadController {
  
  // FormData support
  @FormDataMutation('form-upload', {
    input: formDataParser
  })
  async uploadForm(formData: FormData) {
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    return { name, fileName: file.name, size: file.size };
  }

  // Binary data support
  @BinaryMutation('binary-upload', {
    input: octetInputParser
  })
  async uploadBinary(stream: ReadableStream) {
    // Process binary stream
    return { processed: true };
  }

  // Blob support
  @Mutation('blob-upload', {
    input: z.instanceof(Blob)
  })
  async uploadBlob(blob: Blob) {
    return { type: blob.type, size: blob.size };
  }
}
```

### Streaming Responses

Поддержка стриминга ответов для работы с большими объемами данных:

```typescript
import { StreamingQuery, createStreamingResponse } from 'trpc-nest-decorators';

@Router({ prefix: 'streaming' })
export class StreamingController {
  
  @StreamingQuery('stream-data')
  async streamData() {
    // Async generator для стриминга
    return (async function* () {
      for (let i = 0; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield { count: i, timestamp: new Date() };
      }
    })();
  }

  @StreamingQuery('stream-users')
  async streamUsers() {
    const users = await this.getAllUsers(); // Получить всех пользователей
    return createStreamingResponse(users, {
      batchSize: 10,
      delayMs: 500
    });
  }
}
```

### Server-Sent Events Subscriptions

Улучшенные подписки с поддержкой Server-Sent Events:

```typescript
import { SSESubscription } from 'trpc-nest-decorators';

@Router({ prefix: 'realtime' })
export class RealtimeController {
  
  @SSESubscription('live-updates')
  async liveUpdates() {
    return (async function* () {
      let counter = 0;
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        yield {
          id: counter++,
          message: `Live update #${counter}`,
          timestamp: new Date()
        };
      }
    })();
  }

  @SSESubscription('notifications', {
    input: z.object({ userId: z.string() })
  })
  async userNotifications(input: { userId: string }) {
    // Генерировать уведомления для пользователя
    return this.generateNotifications(input.userId);
  }
}
```

### Shorthand Router Definitions

Упрощенное определение роутеров:

```typescript
// Теперь можно использовать простые объекты для создания под-роутеров
const appRouter = router({
  // Shorthand - простой объект создает под-роутер
  users: {
    getAll: publicProcedure.query(() => getAllUsers()),
    create: publicProcedure.input(z.object({ name: z.string() })).mutation(({ input }) => createUser(input))
  },
  
  // Эквивалентно:
  posts: router({
    getAll: publicProcedure.query(() => getAllPosts()),
    create: publicProcedure.input(z.object({ title: z.string() })).mutation(({ input }) => createPost(input))
  })
});
```

### Новые декораторы tRPC v11

```typescript
// Специализированные декораторы для tRPC v11
@FormDataMutation() // Для FormData
@BinaryMutation()   // Для бинарных данных
@StreamingQuery()   // Для стриминга
@SSESubscription()  // Для Server-Sent Events

// Новые утилиты
import {
  formDataParser,
  blobParser,
  fileParser,
  octetInputParser,
  createStreamingResponse,
  createSSEResponse,
  validateFormDataField,
  createFormDataSchema
} from 'trpc-nest-decorators';
```

### Пример использования всех возможностей

```typescript
@Router({ prefix: 'v11-demo' })
@Injectable()
export class TrpcV11DemoController {
  
  // FormData с валидацией
  @FormDataMutation('upload-profile', {
    input: createFormDataSchema({
      name: z.string().min(1),
      email: z.string().email(),
      avatar: z.instanceof(File)
    })
  })
  async uploadProfile(formData: FormData) {
    const name = validateFormDataField(formData, 'name', z.string());
    const email = validateFormDataField(formData, 'email', z.string().email());
    const avatar = formData.get('avatar') as File;
    
    return { name, email, avatarSize: avatar.size };
  }

  // Стриминг больших данных
  @StreamingQuery('export-data', {
    input: z.object({ format: z.enum(['json', 'csv']) })
  })
  async exportData(input: { format: string }) {
    const data = await this.getAllData();
    return createStreamingResponse(data, { batchSize: 100 });
  }

  // Живые уведомления
  @SSESubscription('live-chat', {
    input: z.object({ roomId: z.string() })
  })
  async liveChat(input: { roomId: string }) {
    return this.generateChatMessages(input.roomId);
  }

  // Обработка бинарных данных
  @BinaryMutation('process-file')
  async processFile(stream: ReadableStream) {
    const chunks = [];
    const reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    return { 
      totalChunks: chunks.length,
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    };
  }
}
```

## Миграция на tRPC v11

Для обновления существующего проекта до tRPC v11:

1. **Обновите зависимости:**
```bash
npm install @trpc/server@^11.0.0 trpc-nest-decorators@^2.0.0
```

2. **Используйте новые возможности:**
```typescript
// Старый код остается совместимым
@Query('users')
async getUsers() { /* ... */ }

// Новые возможности v11
@StreamingQuery('users-stream')
async getUsersStream() { 
  return createStreamingResponse(await this.getUsers(), { batchSize: 10 });
}

@FormDataMutation('upload')
async upload(formData: FormData) { /* ... */ }
```

3. **Обновите импорты:**
```typescript
// Добавьте новые импорты для v11 функций
import { 
  FormDataMutation, 
  StreamingQuery, 
  SSESubscription,
  formDataParser,
  createStreamingResponse
} from 'trpc-nest-decorators';
```

## Документация по tRPC v11

Для получения дополнительной информации о tRPC v11, посетите:
- [Анонс tRPC v11](https://trpc.io/blog/announcing-trpc-v11)
- [Официальная документация tRPC](https://trpc.io/docs)
- [Руководство по миграции на v11](https://trpc.io/docs/migrate-from-v10-to-v11) 