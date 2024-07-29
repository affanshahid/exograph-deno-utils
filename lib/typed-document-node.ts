// deno-lint-ignore-file no-explicit-any

// Source: https://github.com/dotansimha/graphql-typed-document-node/blob/master/packages/core/src/index.ts
// Importing directly from the source does not seem to work with Exograph

import { DocumentNode } from "npm:graphql";

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
