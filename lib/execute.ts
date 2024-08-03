import {
  Exograph,
  ExographPriv,
  AnyVariables,
  ContextOverride,
} from "https://deno.land/x/exograph@v0.9.4/index.ts";
import { DocumentTypeDecoration } from "./typed-document-node.ts";
import { assertInstanceOf } from "jsr:@std/assert@1";

export function executeQueryPriv<T, R extends { [key: string]: never }>(
  exograph: ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
): Promise<T>;
export function executeQueryPriv<T, R extends AnyVariables>(
  exograph: ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
  vars: R,
): Promise<T>;
export function executeQueryPriv<
  T,
  R extends AnyVariables,
  C extends ContextOverride,
>(
  exograph: ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
  vars: R,
  contextOverride: ContextOverride,
): Promise<T>;
export function executeQueryPriv<
  T,
  R extends AnyVariables,
  C extends ContextOverride,
>(
  exograph: ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
  vars?: R,
  contextOverride?: C,
): Promise<T> {
  assertInstanceOf(doc, String, "Expected TypeDocumentString");

  // Convert from String to string
  const op = doc.toString();

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
  doc: DocumentTypeDecoration<T, R>,
): Promise<T>;
export function executeQuery<T, R extends AnyVariables>(
  exograph: Exograph | ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
  vars: R,
): Promise<T>;
export function executeQuery<T, R extends AnyVariables>(
  exograph: Exograph | ExographPriv,
  doc: DocumentTypeDecoration<T, R>,
  vars?: R,
): Promise<T> {
  assertInstanceOf(doc, String, "Expected TypeDocumentString");

  // Convert from String to string
  const op = doc.toString();

  if (vars == undefined) {
    return exograph.executeQuery<T>(op);
  }
  return exograph.executeQuery<T, R>(op, vars);
}
