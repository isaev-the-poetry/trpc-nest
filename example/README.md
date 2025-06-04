# tRPC NestJS Example

Пример приложения, демонстрирующий использование `trpc-nest-decorators` для создания tRPC роутеров из NestJS контроллеров.

## Возможности

- ✨ Автоматическое создание tRPC роутеров из контроллеров NestJS
- 🔄 Короткие декораторы: `@Router`, `@Query`, `@Mutation`, `@Subscription`
- 🛡️ Валидация данных с помощью Zod схем
- 🚀 Полная интеграция с dependency injection NestJS
- 🔗 HTTP endpoints для тестирования tRPC процедур
- 📊 Автоматическая регистрация контроллеров

## Структура проекта

```
example/
├── src/
│   ├── users/               # Контроллер пользователей
│   │   └── users.controller.ts
│   ├── posts/               # Контроллер постов
│   │   └── posts.controller.ts
│   ├── app.controller.ts    # Основной контроллер с демо endpoints
│   ├── app.service.ts       # Сервис с автоматическим роутером
│   ├── app.module.ts        # Главный модуль приложения
│   └── main.ts              # Точка входа
├── demo-trpc-calls.sh       # Демо скрипт с примерами tRPC HTTP adapter
├── test-current-api.sh      # Тестирование текущего API
├── trpc-demo-working.sh     # Полный демо с работающими примерами
└── README.md
```

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Сборка

```bash
npm run build
```

### 3. Запуск приложения

```bash
npm start
```

Или в режиме разработки:

```bash
npm run start:dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Доступные endpoints

### Информационные endpoints

- `GET /api` - информация о приложении и зарегистрированных контроллерах
- `GET /api/trpc-schema` - схема tRPC роутера

### tRPC HTTP endpoints

- `POST /api/trpc/:procedure` - вызов tRPC процедуры

## Примеры использования

### Через curl

#### Query операции (получение данных)

```bash
# Получить всех пользователей
curl -X POST http://localhost:3000/api/trpc/users.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Получить всех постов
curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Получить пользователя по ID
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# Поиск пользователей
curl -X POST http://localhost:3000/api/trpc/users.search \
  -H "Content-Type: application/json" \
  -d '{"query": "john"}'
```

#### Mutation операции (изменение данных)

```bash
# Создать нового пользователя
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "age": 28}'

# Создать новый пост
curl -X POST http://localhost:3000/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{"title": "My Post", "content": "Post content", "authorId": 1}'

# Обновить пост
curl -X POST http://localhost:3000/api/trpc/posts.update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Updated Title"}'
```

## Демо скрипты

Проект включает несколько shell скриптов для демонстрации функциональности:

### 1. Простое тестирование текущего API

```bash
./test-current-api.sh
```

Этот скрипт:
- Проверяет, что сервер запущен
- Показывает информацию о приложении
- Демонстрирует базовый tRPC вызов

### 2. Полная демонстрация работающих примеров

```bash
./trpc-demo-working.sh
```

Этот скрипт демонстрирует:
- ✅ Query процедуры (getAll, getById, search)
- ✅ Mutation процедуры (create, update, delete)
- ✅ Валидацию входных данных с Zod схемами
- ✅ Обработку ошибок для неверных вызовов
- ✅ Сохранение данных в реальном времени
- ✅ Производительность при множественных вызовах

### 3. Примеры для будущей интеграции с tRPC HTTP Adapter

```bash
./demo-trpc-calls.sh
```

Этот скрипт показывает:
- Как будут выглядеть вызовы с полным tRPC HTTP адаптером
- Примеры GET запросов для query
- Примеры POST запросов для mutations
- Batch запросы
- WebSocket subscriptions

## Контроллеры

### UsersController

Контроллер для управления пользователями с процедурами:

- `getAll` - получить всех пользователей
- `getById` - получить пользователя по ID
- `create` - создать нового пользователя
- `delete` - удалить пользователя
- `search` - поиск пользователей по имени/email

### PostsController

Контроллер для управления постами с процедурами:

- `getAll` - получить все посты
- `getById` - получить пост по ID
- `getByAuthor` - получить посты автора
- `create` - создать новый пост
- `update` - обновить пост
- `delete` - удалить пост

## Архитектура

### Автоматическая регистрация

```typescript
@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController,
    private readonly postsController: PostsController
  ) {
    // Автоматическая регистрация контроллеров
    this.autoRouterService.registerController(UsersController, this.usersController);
    this.autoRouterService.registerController(PostsController, this.postsController);
  }

  getTrpcRouter() {
    return createMainRouter(); // Получаем автоматически созданный роутер
  }
}
```

### Декораторы

```typescript
@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() { /* ... */ }
  
  @Mutation('create', { input: CreateUserSchema })
  async createUser(input: CreateUserInput) { /* ... */ }
}
```

## Следующие шаги

1. **Интеграция с фронтендом**: подключите React, Vue или другие фреймворки
2. **Аутентификация**: добавьте JWT или другую систему авторизации
3. **Валидация**: расширьте Zod схемы для всех endpoints
4. **Базы данных**: замените in-memory хранилище на реальную БД
5. **WebSocket subscriptions**: добавьте real-time обновления
6. **Production ready**: добавьте логирование, мониторинг, тесты

## Производительность

Демо показывает, что система способна обрабатывать множественные запросы с минимальной задержкой и автоматически управлять жизненным циклом контроллеров через dependency injection NestJS.

## Лицензия

MIT 