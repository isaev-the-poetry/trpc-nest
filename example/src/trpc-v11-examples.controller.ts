import { Injectable } from '@nestjs/common';
import { 
  Router, 
  Query, 
  Mutation, 
  Subscription,
  FormDataMutation,
  BinaryMutation,
  StreamingQuery,
  SSESubscription
} from 'trpc-nest-decorators';
import { 
  formDataParser,
  octetInputParser,
  createStreamingResponse,
  createSSEResponse,
  validateFormDataField,
  exampleStreamingQuery,
  exampleFormDataMutation,
  exampleBinaryMutation
} from 'trpc-nest-decorators';
import { z } from 'zod';

/**
 * Контроллер с примерами новых возможностей tRPC v11
 */
@Router({ prefix: 'v11-examples' })
@Injectable()
export class TrpcV11ExamplesController {

  // ============================================
  // FormData / Non-JSON Content Types Examples
  // ============================================

  /**
   * Пример mutation с FormData (tRPC v11)
   */
  @FormDataMutation('upload-form', {
    input: formDataParser
  })
  async uploadFormData(formData: FormData) {
    return exampleFormDataMutation(formData);
  }

  /**
   * Пример с валидацией FormData полей
   */
  @FormDataMutation('upload-with-validation', {
    input: formDataParser
  })
  async uploadWithValidation(formData: FormData) {
    // Валидируем поля FormData
    const name = validateFormDataField(formData, 'name', z.string().min(1));
    const email = validateFormDataField(formData, 'email', z.string().email());
    const file = formData.get('file') as File;

    return {
      name,
      email,
      fileName: file?.name,
      fileSize: file?.size,
      uploadedAt: new Date()
    };
  }

  /**
   * Пример binary mutation (Blob, File, Uint8Array, ReadableStream)
   */
  @BinaryMutation('upload-binary', {
    input: octetInputParser
  })
  async uploadBinary(stream: ReadableStream) {
    return exampleBinaryMutation(stream);
  }

  /**
   * Пример работы с Blob
   */
  @Mutation('process-blob', {
    input: z.instanceof(Blob)
  })
  async processBlob(blob: Blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    return {
      type: blob.type,
      size: blob.size,
      byteLength: uint8Array.byteLength,
      processedAt: new Date()
    };
  }

  // ============================================
  // Streaming Responses Examples
  // ============================================

  /**
   * Пример streaming query (tRPC v11)
   */
  @StreamingQuery('stream-numbers')
  async streamNumbers() {
    // Возвращаем async generator
    return exampleStreamingQuery();
  }

  /**
   * Пример streaming из массива данных
   */
  @StreamingQuery('stream-users')
  async streamUsers() {
    const users = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }));

    // Стриминг с задержкой между батчами
    return createStreamingResponse(users, { 
      batchSize: 10, 
      delayMs: 500 
    });
  }

  /**
   * Пример стриминга больших данных
   */
  @StreamingQuery('stream-large-dataset', {
    input: z.object({
      limit: z.number().default(1000),
      batchSize: z.number().default(50)
    })
  })
  async streamLargeDataset(input: { limit: number; batchSize: number }) {
    const data = Array.from({ length: input.limit }, (_, i) => ({
      id: i + 1,
      data: `Large data chunk ${i + 1}`,
      timestamp: new Date(),
      size: Math.random() * 1000
    }));

    return createStreamingResponse(data, {
      batchSize: input.batchSize,
      delayMs: 100
    });
  }

  // ============================================
  // Server-Sent Events Subscriptions Examples
  // ============================================

  /**
   * Пример Server-Sent Events subscription (tRPC v11)
   */
  @SSESubscription('live-updates')
  async liveUpdates() {
    // Генерируем живые обновления
    return this.generateLiveUpdates();
  }

  /**
   * Пример SSE с параметрами
   */
  @SSESubscription('live-metrics', {
    input: z.object({
      interval: z.number().default(1000),
      maxUpdates: z.number().default(100)
    })
  })
  async liveMetrics(input: { interval: number; maxUpdates: number }) {
    return this.generateMetrics(input.interval, input.maxUpdates);
  }

  /**
   * Пример уведомлений в реальном времени
   */
  @SSESubscription('notifications', {
    input: z.object({
      userId: z.string()
    })
  })
  async notifications(input: { userId: string }) {
    return this.generateNotifications(input.userId);
  }

  // ============================================
  // Improved Subscriptions with Generators
  // ============================================

  /**
   * Пример subscription с JavaScript generator
   */
  @Subscription('generator-subscription')
  async generatorSubscription() {
    return this.createGeneratorSubscription();
  }

  // ============================================
  // Shorthand Router Examples
  // ============================================

  /**
   * Пример обычного query для сравнения
   */
  @Query('simple-data')
  async getSimpleData() {
    return {
      message: 'This is simple data from tRPC v11',
      timestamp: new Date(),
      version: '11.0.0'
    };
  }

  /**
   * Пример с валидацией входных и выходных данных
   */
  @Query('validated-data', {
    input: z.object({
      filter: z.string().optional(),
      limit: z.number().min(1).max(100).default(10)
    }),
    output: z.object({
      items: z.array(z.object({
        id: z.number(),
        name: z.string(),
        createdAt: z.date()
      })),
      total: z.number(),
      hasMore: z.boolean()
    })
  })
  async getValidatedData(input: { filter?: string; limit: number }) {
    const items = Array.from({ length: input.limit }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}${input.filter ? ` (${input.filter})` : ''}`,
      createdAt: new Date()
    }));

    return {
      items,
      total: items.length,
      hasMore: false
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async* generateLiveUpdates() {
    let counter = 0;
    while (counter < 50) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      yield {
        id: counter++,
        message: `Live update #${counter}`,
        timestamp: new Date(),
        data: Math.random()
      };
    }
  }

  private async* generateMetrics(interval: number, maxUpdates: number) {
    let counter = 0;
    while (counter < maxUpdates) {
      await new Promise(resolve => setTimeout(resolve, interval));
      yield {
        timestamp: new Date(),
        cpu: Math.random() * 100,
        memory: Math.random() * 8192,
        disk: Math.random() * 1024,
        network: Math.random() * 1000
      };
      counter++;
    }
  }

  private async* generateNotifications(userId: string) {
    const notifications = [
      'New message received',
      'Your order has been processed',
      'Payment confirmed',
      'New follower',
      'System maintenance scheduled'
    ];

    for (let i = 0; i < notifications.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      yield {
        id: `notif_${Date.now()}`,
        userId,
        message: notifications[i],
        type: 'info',
        timestamp: new Date()
      };
    }
  }

  private async* createGeneratorSubscription() {
    let count = 0;
    while (count < 20) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      yield {
        count: ++count,
        message: `Generator message ${count}`,
        timestamp: new Date(),
        random: Math.random()
      };
    }
  }
} 