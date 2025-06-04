import { AnyRouter, AnyProcedure } from '@trpc/server';
import { z } from 'zod';

export interface TrpcRouterMetadata {
  path: string;
  procedures: Map<string, TrpcProcedureMetadata>;
}

export interface TrpcProcedureMetadata {
  type: 'query' | 'mutation' | 'subscription';
  path: string;
  method: string;
  input?: any;
  output?: any;
  streaming?: boolean;
  contentType?: 'json' | 'formdata' | 'octet-stream' | 'text';
  serverSentEvents?: boolean;
}

export interface TrpcControllerOptions {
  prefix?: string;
}

export interface TrpcProcedureOptions {
  input?: any;
  output?: any;
  streaming?: boolean;
  contentType?: 'json' | 'formdata' | 'octet-stream' | 'text';
  serverSentEvents?: boolean;
}

// tRPC v11 Content Type Support
export type TrpcV11ContentTypes = 
  | FormData
  | Blob
  | File
  | Uint8Array
  | ReadableStream
  | AsyncIterable<any>;

// tRPC v11 Streaming Support
export interface StreamingOptions {
  enabled: boolean;
  batchSize?: number;
  throttleMs?: number;
}

// tRPC v11 Server-Sent Events Support
export interface SSESubscriptionOptions {
  enabled: boolean;
  heartbeatMs?: number;
  reconnectMs?: number;
}

export const TRPC_ROUTER_METADATA = Symbol('trpc:router');
export const TRPC_PROCEDURE_METADATA = Symbol('trpc:procedure'); 