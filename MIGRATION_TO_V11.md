# Миграция на tRPC v11

Это руководство поможет вам обновить ваш проект `trpc-nest-decorators` для поддержки новых возможностей tRPC v11.

## 🎉 Что нового в tRPC v11

Согласно [официальному анонсу tRPC v11](https://trpc.io/blog/announcing-trpc-v11), основные новшества включают:

### ✨ Ключевые возможности

1. **FormData / Non-JSON Content Types Support** - поддержка FormData, Blob, File, Uint8Array
2. **Streaming Responses** - стриминг ответов для больших объемов данных
3. **Server-Sent Events Subscriptions** - улучшенные подписки с SSE
4. **Shorthand Router Definitions** - упрощенный синтаксис роутеров
5. **TanStack Query v5 Support** - полная поддержка React Suspense
6. **Improved Subscriptions with Generators** - поддержка JavaScript generators

## 📦 Обновление зависимостей

### 1. Обновите пакеты

```bash
# Обновить основные пакеты
npm install @trpc/server@^11.0.0 trpc-nest-decorators@^2.0.0

# Если используете клиент
npm install @trpc/client@^11.0.0

# Если используете React
npm install @trpc/react-query@^11.0.0 @tanstack/react-query@^5.0.0
```

### 2. Обновите package.json

```json
{
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "trpc-nest-decorators": "^2.0.0"
  }
}
```

## 🔄 Обновление существующего кода

### Контроллеры остаются совместимыми

Ваш существующий код будет работать без изменений:

```typescript
// ✅ Этот код продолжит работать
@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() {
    return [{ id: 1, name: 'John' }];
  }

  @Mutation('create', {
    input: z.object({ name: z.string() })
  })
  async createUser(input: { name: string }) {
    return { id: Date.now(), name: input.name };
  }
}
```

## 🆕 Использование новых возможностей

### 1. FormData поддержка

```typescript
import { FormDataMutation, formDataParser, validateFormDataField } from 'trpc-nest-decorators';

@Router({ prefix: 'upload' })
export class UploadController {
  @FormDataMutation('file-upload', {
    input: formDataParser
  })
  async uploadFile(formData: FormData) {
    const name = validateFormDataField(formData, 'name', z.string());
    const file = formData.get('file') as File;
    
    return {
      name,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date()
    };
  }
}
```

### 2. Streaming Responses

```typescript
import { StreamingQuery, createStreamingResponse } from 'trpc-nest-decorators';

@Router({ prefix: 'data' })
export class DataController {
  @StreamingQuery('export')
  async exportData() {
    // Async generator
    return (async function* () {
      for (let i = 0; i < 1000; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        yield { id: i, data: `Item ${i}` };
      }
    })();
  }

  @StreamingQuery('users-batch')
  async streamUsers() {
    const users = await this.getAllUsers();
    return createStreamingResponse(users, {
      batchSize: 10,
      delayMs: 100
    });
  }
}
```

### 3. Server-Sent Events Subscriptions

```typescript
import { SSESubscription } from 'trpc-nest-decorators';

@Router({ prefix: 'realtime' })
export class RealtimeController {
  @SSESubscription('live-updates')
  async liveUpdates() {
    return (async function* () {
      let counter = 0;
      while (counter < 100) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        yield {
          id: counter++,
          message: `Update ${counter}`,
          timestamp: new Date()
        };
      }
    })();
  }
}
```

### 4. Binary Data Support

```typescript
import { BinaryMutation, octetInputParser } from 'trpc-nest-decorators';

@Router({ prefix: 'binary' })
export class BinaryController {
  @BinaryMutation('process-stream', {
    input: octetInputParser
  })
  async processStream(stream: ReadableStream) {
    const reader = stream.getReader();
    let totalBytes = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
      }
    } finally {
      reader.releaseLock();
    }
    
    return { totalBytes, processedAt: new Date() };
  }

  @Mutation('process-blob', {
    input: z.instanceof(Blob)
  })
  async processBlob(blob: Blob) {
    const arrayBuffer = await blob.arrayBuffer();
    return {
      type: blob.type,
      size: blob.size,
      processedAt: new Date()
    };
  }
}
```

## 🎨 Обновление клиентского кода

### 1. Обновите клиент для стриминга

```typescript
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Использование стриминга
async function useStreaming() {
  const stream = await client.data.export.query();
  
  for await (const item of stream) {
    console.log('Received:', item);
    // Обновить UI
  }
}
```

### 2. FormData на клиенте

```typescript
async function uploadFile() {
  const formData = new FormData();
  formData.append('name', 'My File');
  formData.append('file', fileInput.files[0]);
  
  const result = await client.upload.fileUpload.mutate(formData);
  console.log('Upload result:', result);
}
```

### 3. Подписки с WebSocket

```typescript
import { createWSClient, wsLink } from '@trpc/client';

const wsClient = createWSClient({
  url: 'ws://localhost:3000/trpc',
});

const wsClientTrpc = createTRPCClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
});

// Подписка на живые обновления
const unsubscribe = wsClientTrpc.realtime.liveUpdates.subscribe(undefined, {
  onData: (data) => {
    console.log('Live update:', data);
  },
  onError: (error) => {
    console.error('Subscription error:', error);
  }
});
```

## ⚛️ React Integration

### 1. Обновите React Query

```bash
npm install @tanstack/react-query@^5.0.0 @trpc/react-query@^11.0.0
```

### 2. Новый клиент setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchStreamLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';

const queryClient = new QueryClient();
const trpc = createTRPCReact<AppRouter>();

const trpcClient = trpc.createClient({
  links: [
    httpBatchStreamLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <MyApp />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 3. Использование в компонентах

```typescript
// Обычные queries и mutations
function UsersList() {
  const { data, isLoading } = trpc.users.getAll.useQuery();
  const createMutation = trpc.users.create.useMutation();
  
  // ... компонент
}

// FormData upload
function FileUpload() {
  const uploadMutation = trpc.upload.fileUpload.useMutation();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await uploadMutation.mutateAsync(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="file" type="file" required />
      <button type="submit">Upload</button>
    </form>
  );
}

// Subscriptions
function LiveUpdates() {
  const [updates, setUpdates] = useState([]);
  
  trpc.realtime.liveUpdates.useSubscription(undefined, {
    onData: (update) => {
      setUpdates(prev => [update, ...prev].slice(0, 10));
    }
  });
  
  return (
    <div>
      {updates.map(update => (
        <div key={update.id}>{update.message}</div>
      ))}
    </div>
  );
}
```

## 🔧 Конфигурация сервера

### 1. Обновите HTTP adapter

```typescript
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './context';
import { appRouter } from './router';

// Регистрируйте tRPC с поддержкой стриминга
await fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { 
    router: appRouter, 
    createContext,
    // Включить поддержку стриминга
    batching: {
      enabled: true,
    },
  },
});
```

### 2. WebSocket для subscriptions

```typescript
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';

const wss = new ws.Server({
  port: 3001,
});

applyWSSHandler({ wss, router: appRouter, createContext });
```

## 📝 Полный пример миграции

### До (tRPC v10)

```typescript
@Router({ prefix: 'users' })
export class UsersController {
  @Query('getAll')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Mutation('create', {
    input: z.object({ name: z.string() })
  })
  async createUser(input: { name: string }) {
    return this.userService.create(input);
  }
}
```

### После (tRPC v11)

```typescript
import { 
  Router, Query, Mutation, 
  StreamingQuery, FormDataMutation, SSESubscription,
  formDataParser, createStreamingResponse 
} from 'trpc-nest-decorators';

@Router({ prefix: 'users' })
export class UsersController {
  // Старый код работает без изменений
  @Query('getAll')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @Mutation('create', {
    input: z.object({ name: z.string() })
  })
  async createUser(input: { name: string }) {
    return this.userService.create(input);
  }

  // Новые возможности v11
  @StreamingQuery('stream-all')
  async streamAllUsers() {
    const users = await this.userService.findAll();
    return createStreamingResponse(users, { batchSize: 10 });
  }

  @FormDataMutation('upload-avatar', {
    input: formDataParser
  })
  async uploadAvatar(formData: FormData) {
    const userId = formData.get('userId') as string;
    const avatar = formData.get('avatar') as File;
    return this.userService.updateAvatar(userId, avatar);
  }

  @SSESubscription('live-count')
  async liveUserCount() {
    return (async function* () {
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const count = await this.userService.count();
        yield { count, timestamp: new Date() };
      }
    }.bind(this))();
  }
}
```

## ⚠️ Потенциальные проблемы

### 1. Breaking changes

- Если вы использовали `.interop()` режим из v9, он больше не поддерживается
- TanStack Query v5 требует обновления React Query кода

### 2. TypeScript

- Убедитесь, что используете TypeScript 5.0+
- Обновите типы для FormData и ReadableStream

### 3. Производительность

- Стриминг потребляет больше памяти для больших объемов данных
- SSE подписки создают постоянные соединения

## 🎯 Рекомендации

### 1. Поэтапная миграция

1. Сначала обновите зависимости
2. Убедитесь, что существующий код работает
3. Постепенно добавляйте новые возможности v11

### 2. Тестирование

```typescript
// Пример тестов для новых возможностей
describe('tRPC v11 Features', () => {
  it('should handle FormData upload', async () => {
    const formData = new FormData();
    formData.append('name', 'test');
    
    const result = await client.upload.fileUpload.mutate(formData);
    expect(result.name).toBe('test');
  });

  it('should stream data', async () => {
    const stream = await client.data.export.query();
    const items = [];
    
    for await (const item of stream) {
      items.push(item);
      if (items.length >= 5) break; // Limit for test
    }
    
    expect(items).toHaveLength(5);
  });
});
```

### 3. Мониторинг

- Следите за использованием памяти при стриминге
- Мониторьте количество активных WebSocket соединений
- Логируйте ошибки в subscriptions

## 📚 Дополнительные ресурсы

- [Официальная документация tRPC v11](https://trpc.io/docs)
- [Анонс tRPC v11](https://trpc.io/blog/announcing-trpc-v11)
- [TanStack Query v5 Migration Guide](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)
- [Примеры кода в репозитории](./example/src/trpc-v11-examples.controller.ts)

## 🤝 Поддержка

Если у вас возникли проблемы с миграцией:

1. Проверьте [issues в репозитории](https://github.com/your-repo/issues)
2. Создайте новый issue с описанием проблемы
3. Посетите [Discord сообщество tRPC](https://trpc.io/discord)

---

**Поздравляем с переходом на tRPC v11! 🎉** 