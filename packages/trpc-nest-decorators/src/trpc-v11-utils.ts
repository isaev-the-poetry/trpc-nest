import { z } from 'zod';

/**
 * tRPC v11 Content Type Parsers
 */

// FormData parser for tRPC v11 (with Node.js compatibility)
export const formDataParser = z.custom<FormData>((val) => {
  if (typeof FormData !== 'undefined') {
    return val instanceof FormData;
  }
  return false;
});

// Binary data parsers (with Node.js compatibility)
export const blobParser = z.custom<Blob>((val) => {
  if (typeof Blob !== 'undefined') {
    return val instanceof Blob;
  }
  return false;
});

export const fileParser = z.custom<File>((val) => {
  if (typeof File !== 'undefined') {
    return val instanceof File;
  }
  return false;
});

export const uint8ArrayParser = z.instanceof(Uint8Array);

// Generic octet stream parser
export const octetInputParser = z.custom<ReadableStream<any>>((val) => {
  if (typeof ReadableStream !== 'undefined') {
    return val instanceof ReadableStream;
  }
  return false;
});

/**
 * Streaming utilities for tRPC v11
 */

/**
 * Create async generator for streaming responses
 */
export async function* createStreamingResponse<T>(
  data: T[],
  options: { batchSize?: number; delayMs?: number } = {}
) {
  const { batchSize = 1, delayMs = 100 } = options;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    yield batch.length === 1 ? batch[0] : batch;
    
    if (delayMs > 0 && i + batchSize < data.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Create async generator from observable-like source
 */
export async function* createStreamFromObservable<T>(
  source: { subscribe: (callback: (value: T) => void) => () => void }
): AsyncGenerator<T> {
  const values: T[] = [];
  let isComplete = false;
  let error: Error | null = null;
  
  const unsubscribe = source.subscribe((value) => {
    values.push(value);
  });

  try {
    while (!isComplete && !error) {
      if (values.length > 0) {
        yield values.shift()!;
      } else {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  } finally {
    unsubscribe();
  }
  
  if (error) {
    throw error;
  }
}

/**
 * Server-Sent Events utilities
 */

export interface SSEOptions {
  heartbeatMs?: number;
  reconnectMs?: number;
  headers?: Record<string, string>;
}

/**
 * Create Server-Sent Events response
 */
export function createSSEResponse<T>(
  source: AsyncIterable<T>,
  options: SSEOptions = {}
) {
  const { heartbeatMs = 30000, headers = {} } = options;
  
  return {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      ...headers
    },
    body: createSSEStream(source, { heartbeatMs })
  };
}

async function* createSSEStream<T>(
  source: AsyncIterable<T>,
  options: { heartbeatMs: number }
): AsyncGenerator<string> {
  let lastHeartbeat = Date.now();
  
  for await (const data of source) {
    const now = Date.now();
    
    // Send heartbeat if needed
    if (now - lastHeartbeat > options.heartbeatMs) {
      yield `: heartbeat\n\n`;
      lastHeartbeat = now;
    }
    
    // Send data
    yield `data: ${JSON.stringify(data)}\n\n`;
    lastHeartbeat = now;
  }
}

/**
 * Validation helpers for tRPC v11
 */

// Validate FormData fields (with browser compatibility check)
export function validateFormDataField(
  formData: FormData,
  fieldName: string,
  validator: z.ZodType
) {
  if (typeof FormData === 'undefined') {
    throw new Error('FormData is not available in this environment');
  }
  const value = formData.get(fieldName);
  return validator.parse(value);
}

// Create FormData schema (with browser compatibility check)
export function createFormDataSchema(fields: Record<string, z.ZodType>) {
  return z.custom<FormData>((val) => {
    if (typeof FormData === 'undefined') {
      return false;
    }
    
    if (!(val instanceof FormData)) {
      return false;
    }
    
    for (const [fieldName, validator] of Object.entries(fields)) {
      try {
        const value = val.get(fieldName);
        validator.parse(value);
      } catch {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Type guards for tRPC v11 content types (with environment checks)
 */

export function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export function isBlob(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob;
}

export function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

export function isUint8Array(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

export function isReadableStream(value: unknown): value is ReadableStream {
  return typeof ReadableStream !== 'undefined' && value instanceof ReadableStream;
}

export function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return value != null && typeof (value as any)[Symbol.asyncIterator] === 'function';
}

/**
 * Content type helpers
 */

export function getContentTypeFromInput(input: unknown): string {
  if (isFormData(input)) return 'multipart/form-data';
  if (isBlob(input) || isFile(input)) return 'application/octet-stream';
  if (isUint8Array(input)) return 'application/octet-stream';
  if (isReadableStream(input)) return 'application/octet-stream';
  return 'application/json';
}

/**
 * Environment compatibility helpers
 */

export function isWebEnvironment(): boolean {
  return typeof globalThis !== 'undefined' && 
         'window' in globalThis && 
         'document' in globalThis;
}

export function isNodeEnvironment(): boolean {
  return typeof globalThis !== 'undefined' && 
         'process' in globalThis && 
         (globalThis as any).process?.versions?.node !== undefined;
}

/**
 * Example usage patterns for tRPC v11 features (browser only)
 */

// Example streaming query
export async function* exampleStreamingQuery() {
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield { count: i, timestamp: new Date() };
  }
}

// Example FormData mutation (browser only)
export function exampleFormDataMutation(formData: FormData) {
  if (!isWebEnvironment()) {
    throw new Error('FormData examples only work in browser environment');
  }
  
  const name = formData.get('name') as string;
  const file = formData.get('file') as File;
  
  return {
    name,
    fileName: file?.name,
    fileSize: file?.size,
    uploadedAt: new Date()
  };
}

// Example binary mutation (works in both environments)
export async function exampleBinaryMutation(stream: ReadableStream) {
  if (!isReadableStream(stream)) {
    throw new Error('ReadableStream is not available in this environment');
  }
  
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