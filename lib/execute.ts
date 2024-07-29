import {
  Exograph,
  ExographPriv,
  AnyVariables,
  ContextOverride,
} from "https://deno.land/x/exograph@v0.9.4/index.ts";
import { TypedDocumentNode } from "./typed-document-node.ts";
import { print } from "npm:graphql";

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
  const op = print(doc);

  if (vars === undefined) {
    if (contextOverride !== undefined) {
      return exograph.executeQueryPriv<T, undefined, C>(
        op,
        undefined,
        contextOverride,
      );
    }

    return exograph.executeQueryPriv<T>(op);
  }

  if (contextOverride === undefined) {
    return exograph.executeQueryPriv<T, R>(op, vars);
  }

  return exograph.executeQueryPriv<T, R, C>(op, vars, contextOverride);
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
  const op = print(doc);

  if (vars == undefined) {
    return exograph.executeQuery<T>(op);
  }
  return exograph.executeQuery<T, R>(op, vars);
}
