import { AnyRouter, AnyProcedure } from '@trpc/server';

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
}

export interface TrpcControllerOptions {
  prefix?: string;
}

export interface TrpcProcedureOptions {
  input?: any;
  output?: any;
}

export const TRPC_ROUTER_METADATA = Symbol('trpc:router');
export const TRPC_PROCEDURE_METADATA = Symbol('trpc:procedure'); 