/**
 * Примеры клиентского кода для tRPC v11
 * Демонстрация использования новых возможностей на клиенте
 * 
 * ПРИМЕЧАНИЕ: Этот файл содержит примеры кода для демонстрации.
 * Для использования установите необходимые зависимости:
 * npm install @trpc/client @trpc/react-query @tanstack/react-query
 */

// Типы для примеров
type AppRouter = any; // Замените на ваш тип роутера

// Примеры импортов (раскомментируйте при использовании)
// import { createTRPCClient, httpBatchStreamLink, createWSClient, wsLink } from '@trpc/client';
// import type { AppRouter } from './path-to-your-router';

/**
 * ====================================
 * Client Setup Examples
 * ====================================
 */

// Пример создания клиента с поддержкой стриминга (tRPC v11)
export function createTRPCStreamingClient() {
  // Раскомментируйте при использовании:
  /*
  const client = createTRPCClient<AppRouter>({
    links: [
      // httpBatchStreamLink для поддержки стриминга
      httpBatchStreamLink({
        url: 'http://localhost:3000/trpc',
        // Поддержка различных content types
        headers: () => ({
          'Content-Type': 'application/json',
        }),
      }),
    ],
  });
  return client;
  */
  return null;
}

// Пример WebSocket клиента для subscriptions
export function createTRPCWebSocketClient() {
  // Раскомментируйте при использовании:
  /*
  const wsClient = createWSClient({
    url: 'ws://localhost:3000/trpc',
  });

  const wsClientTrpc = createTRPCClient<AppRouter>({
    links: [
      wsLink({
        client: wsClient,
      }),
    ],
  });
  
  return wsClientTrpc;
  */
  return null;
}

/**
 * ====================================
 * FormData / Non-JSON Content Examples
 * ====================================
 */

// Пример отправки FormData
export async function uploadFormDataExample() {
  // const client = createTRPCStreamingClient();
  
  const formData = new FormData();
  formData.append('name', 'John Doe');
  formData.append('email', 'john@example.com');
  
  // Добавляем файл
  const fileInput = document.querySelector('#file-input') as HTMLInputElement;
  if (fileInput?.files?.[0]) {
    formData.append('file', fileInput.files[0]);
  }

  try {
    // const result = await client['v11-examples'].uploadForm.mutate(formData);
    console.log('FormData would be uploaded:', formData);
    // return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Пример отправки Blob
export async function uploadBlobExample() {
  // const client = createTRPCStreamingClient();
  
  const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
  
  try {
    // const result = await client['v11-examples'].processBlob.mutate(blob);
    console.log('Blob would be processed:', blob);
    // return result;
  } catch (error) {
    console.error('Blob processing failed:', error);
    throw error;
  }
}

// Пример отправки бинарных данных
export async function uploadBinaryExample() {
  // const client = createTRPCStreamingClient();
  
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    }
  });

  try {
    // const result = await client['v11-examples'].uploadBinary.mutate(stream);
    console.log('Binary data would be uploaded:', stream);
    // return result;
  } catch (error) {
    console.error('Binary upload failed:', error);
    throw error;
  }
}

/**
 * ====================================
 * Streaming Responses Examples
 * ====================================
 */

// Пример получения стримингового ответа
export async function streamNumbersExample() {
  // const client = createTRPCStreamingClient();
  
  try {
    // const stream = await client['v11-examples'].streamNumbers.query();
    
    // Пример обработки AsyncIterable
    console.log('Would process streaming data...');
    /*
    for await (const data of stream) {
      console.log('Received streaming data:', data);
      
      // Обновление UI в реальном времени
      updateUI(data);
    }
    */
  } catch (error) {
    console.error('Streaming failed:', error);
    throw error;
  }
}

// Пример стриминга пользователей с UI обновлениями
export async function streamUsersWithProgressExample() {
  // const client = createTRPCStreamingClient();
  
  const progressElement = document.querySelector('#progress') as HTMLProgressElement;
  const listElement = document.querySelector('#users-list') as HTMLUListElement;
  
  let count = 0;
  const total = 100; // Ожидаемое количество пользователей
  
  try {
    // const stream = await client['v11-examples'].streamUsers.query();
    
    console.log('Would stream users with progress...');
    /*
    for await (const users of stream) {
      // users может быть массивом (батч) или одним пользователем
      const userArray = Array.isArray(users) ? users : [users];
      
      userArray.forEach(user => {
        count++;
        
        // Добавляем пользователя в список
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        listElement?.appendChild(li);
        
        // Обновляем прогресс
        if (progressElement) {
          progressElement.value = (count / total) * 100;
        }
      });
    }
    
    console.log(`Loaded ${count} users via streaming`);
    */
  } catch (error) {
    console.error('User streaming failed:', error);
    throw error;
  }
}

// Пример стриминга больших данных с настройками
export async function streamLargeDatasetExample() {
  // const client = createTRPCStreamingClient();
  
  const options = {
    limit: 1000,
    batchSize: 50
  };
  
  try {
    // const stream = await client['v11-examples'].streamLargeDataset.query(options);
    
    let processedCount = 0;
    console.log('Would stream large dataset...');
    /*
    for await (const batch of stream) {
      const items = Array.isArray(batch) ? batch : [batch];
      processedCount += items.length;
      
      console.log(`Processed ${processedCount} items so far...`);
      
      // Обработка батча данных
      processBatch(items);
      
      // Небольшая задержка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Total processed: ${processedCount} items`);
    */
  } catch (error) {
    console.error('Large dataset streaming failed:', error);
    throw error;
  }
}

/**
 * ====================================
 * Server-Sent Events Subscriptions
 * ====================================
 */

// Пример подписки на живые обновления
export function subscribeLiveUpdatesExample() {
  // const wsClient = createTRPCWebSocketClient();
  
  console.log('Would subscribe to live updates...');
  /*
  const subscription = wsClient['v11-examples'].liveUpdates.subscribe(undefined, {
    onData: (data) => {
      console.log('Live update received:', data);
      
      // Показать уведомление
      showNotification(`Update #${data.id}: ${data.message}`);
      
      // Обновить UI
      updateLiveData(data);
    },
    onError: (error) => {
      console.error('Live updates subscription error:', error);
    },
    onComplete: () => {
      console.log('Live updates subscription completed');
    }
  });

  // Возвращаем функцию для отписки
  return () => subscription.unsubscribe();
  */
  return () => console.log('Unsubscribed from live updates');
}

// Пример подписки на метрики с параметрами
export function subscribeMetricsExample(interval: number = 1000, maxUpdates: number = 100) {
  // const wsClient = createTRPCWebSocketClient();
  
  console.log('Would subscribe to metrics...');
  /*
  const subscription = wsClient['v11-examples'].liveMetrics.subscribe(
    { interval, maxUpdates },
    {
      onData: (metrics) => {
        console.log('Metrics received:', metrics);
        
        // Обновить дашборд метрик
        updateMetricsDashboard(metrics);
      },
      onError: (error) => {
        console.error('Metrics subscription error:', error);
      }
    }
  );

  return () => subscription.unsubscribe();
  */
  return () => console.log('Unsubscribed from metrics');
}

// Пример подписки на уведомления пользователя
export function subscribeUserNotificationsExample(userId: string) {
  // const wsClient = createTRPCWebSocketClient();
  
  console.log(`Would subscribe to notifications for user: ${userId}`);
  /*
  const subscription = wsClient['v11-examples'].notifications.subscribe(
    { userId },
    {
      onData: (notification) => {
        console.log('Notification received:', notification);
        
        // Показать push-уведомление
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.message, {
            icon: '/notification-icon.png',
            body: `Notification for ${notification.userId}`
          });
        }
        
        // Добавить в список уведомлений
        addNotificationToList(notification);
      },
      onError: (error) => {
        console.error('Notifications subscription error:', error);
      }
    }
  );

  return () => subscription.unsubscribe();
  */
  return () => console.log('Unsubscribed from notifications');
}

/**
 * ====================================
 * React Hooks Examples (код для справки)
 * ====================================
 */

// Примеры React хуков для tRPC v11 (только для справки)
export const reactHooksExamples = `
import { trpc } from './trpc-client';

// Обычный query
function UsersList() {
  const { data: users, isLoading } = trpc['v11-examples'].getSimpleData.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{JSON.stringify(users)}</div>;
}

// Streaming query (требует специальной обработки)
function StreamingUsersList() {
  const [users, setUsers] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const startStreaming = useCallback(async () => {
    setIsStreaming(true);
    try {
      const stream = await client['v11-examples'].streamUsers.query();
      for await (const batch of stream) {
        setUsers(prev => [...prev, ...(Array.isArray(batch) ? batch : [batch])]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsStreaming(false);
    }
  }, []);
  
  return (
    <div>
      <button onClick={startStreaming} disabled={isStreaming}>
        {isStreaming ? 'Streaming...' : 'Start Streaming'}
      </button>
      <ul>
        {users.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </div>
  );
}

// FormData upload
function FileUpload() {
  const uploadMutation = trpc['v11-examples'].uploadForm.useMutation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const result = await uploadMutation.mutateAsync(formData);
      console.log('Upload success:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="email" type="email" required />
      <input name="file" type="file" required />
      <button type="submit" disabled={uploadMutation.isLoading}>
        {uploadMutation.isLoading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

// Subscription
function LiveUpdates() {
  const [updates, setUpdates] = useState([]);
  
  trpc['v11-examples'].liveUpdates.useSubscription(undefined, {
    onData: (update) => {
      setUpdates(prev => [update, ...prev].slice(0, 10)); // Keep last 10
    }
  });
  
  return (
    <div>
      <h3>Live Updates</h3>
      {updates.map(update => (
        <div key={update.id}>{update.message}</div>
      ))}
    </div>
  );
}
`;

/**
 * ====================================
 * Utility Functions (примеры)
 * ====================================
 */

function updateUI(data: any) {
  // Обновление пользовательского интерфейса
  const element = document.querySelector('#streaming-data');
  if (element) {
    element.textContent = JSON.stringify(data, null, 2);
  }
}

function processBatch(items: any[]) {
  // Обработка батча данных
  console.log(`Processing batch of ${items.length} items`);
}

function showNotification(message: string) {
  // Показать уведомление пользователю
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function updateLiveData(data: any) {
  // Обновить живые данные в UI
  const element = document.querySelector('#live-data');
  if (element) {
    element.innerHTML = `
      <div>Update #${data.id}</div>
      <div>${data.message}</div>
      <div>${new Date(data.timestamp).toLocaleTimeString()}</div>
    `;
  }
}

function updateMetricsDashboard(metrics: any) {
  // Обновить дашборд метрик
  const elements = {
    cpu: document.querySelector('#cpu-metric'),
    memory: document.querySelector('#memory-metric'),
    disk: document.querySelector('#disk-metric'),
    network: document.querySelector('#network-metric')
  };
  
  if (elements.cpu) elements.cpu.textContent = `${metrics.cpu.toFixed(1)}%`;
  if (elements.memory) elements.memory.textContent = `${metrics.memory.toFixed(0)}MB`;
  if (elements.disk) elements.disk.textContent = `${metrics.disk.toFixed(0)}MB`;
  if (elements.network) elements.network.textContent = `${metrics.network.toFixed(1)}KB/s`;
}

function addNotificationToList(notification: any) {
  // Добавить уведомление в список
  const list = document.querySelector('#notifications-list');
  if (list) {
    const item = document.createElement('li');
    item.innerHTML = `
      <div>${notification.message}</div>
      <small>${new Date(notification.timestamp).toLocaleString()}</small>
    `;
    list.insertBefore(item, list.firstChild);
  }
} 