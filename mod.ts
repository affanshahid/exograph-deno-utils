// deno-lint-ignore-file no-explicit-any

import { DocumentNode } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";
import {
  Exograph,
  ExographPriv,
  AnyVariables,
  ContextOverride,
} from "https://deno.land/x/exograph@v0.9.4/index.ts";

// Copied from https://github.com/dotansimha/graphql-typed-document-node/blob/master/packages/core/src/index.ts
// Importing directly does not seem to work with Exograph
export interface DocumentTypeDecoration<TResult, TVariables> {
  /**
   * This type is used to ensure that the variables you pass in to the query are assignable to Variables
   * and that the Result is assignable to whatever you pass your result to. The method is never actually
   * implemented, but the type is valid because we list it as optional
   */
  __apiType?: (variables: TVariables) => TResult;
}

export interface TypedDocumentNode<
  TResult = { [key: string]: any },
  TVariables = { [key: string]: any },
> extends DocumentNode,
    DocumentTypeDecoration<TResult, TVariables> {}

/**
 * Helper for extracting a TypeScript type for operation result from a TypedDocumentNode and TypedDocumentString.
 * @example
 * const myQuery = { ... }; // TypedDocumentNode<R, V>
 * type ResultType = ResultOf<typeof myQuery>; // Now it's R
 */
export type ResultOf<T> =
  T extends DocumentTypeDecoration<infer ResultType, infer VariablesType>
    ? ResultType
    : never;

/**
 * Helper for extracting a TypeScript type for operation variables from a TypedDocumentNode and TypedDocumentString.
 * @example
 * const myQuery = { ... }; // TypedDocumentNode<R, V>
 * type VariablesType = VariablesOf<typeof myQuery>; // Now it's V
 */
export type VariablesOf<T> =
  T extends DocumentTypeDecoration<infer ResultType, infer VariablesType>
    ? VariablesType
    : never;

export function executeQueryPriv<T, R extends { [key: string]: never }>(
  exograph: ExographPriv,
  doc: TypedDocumentNode<T, R>,
): Promise<T>;
export function executeQueryPriv<T, R extends AnyVariables>(
  exograph: ExographPriv,
  doc: TypedDocumentNode<T, R>,
  vars: R,
): Promise<T>;
export function executeQueryPriv<
  T,
  R extends AnyVariables,
  C extends ContextOverride,
>(
  exograph: ExographPriv,
  doc: TypedDocumentNode<T, R>,
  vars: R,
  contextOverride: ContextOverride,
): Promise<T>;
export function executeQueryPriv<
  T,
  R extends AnyVariables,
  C extends ContextOverride,
>(
  exograph: ExographPriv,
  doc: TypedDocumentNode<T, R>,
  vars?: R,
  contextOverride?: C,
): Promise<T> {
  if (vars === undefined) {
    return exograph.executeQueryPriv<T>(doc.loc!.source.body);
  }

  if (contextOverride === undefined) {
    return exograph.executeQueryPriv<T, R>(doc.loc!.source.body, vars);
  }

  return exograph.executeQueryPriv<T>(
    doc.loc!.source.body,
    vars,
    contextOverride,
  );
}

export function executeQuery<T, R extends { [key: string]: never }>(
  exograph: Exograph | ExographPriv,
  doc: TypedDocumentNode<T, R>,
): Promise<T>;
export function executeQuery<T, R extends AnyVariables>(
  exograph: Exograph | ExographPriv,
  doc: TypedDocumentNode<T, R>,
  vars: R,
): Promise<T>;
export function executeQuery<T, R extends AnyVariables>(
  exograph: Exograph | ExographPriv,
  doc: TypedDocumentNode<T, R>,
  vars?: R,
): Promise<T> {
  if (vars == undefined) {
    return exograph.executeQuery<T>(doc.loc!.source.body);
  }
  return exograph.executeQuery<T, R>(doc.loc!.source.body, vars);
}
