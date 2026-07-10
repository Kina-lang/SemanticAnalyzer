import {
  BaseNode,
  FunctionTypeNode,
  IdentifierExpressionNode,
  MemberAccessExpressionNode,
  NodeKind,
  PrimitiveTypeNode,
  UserDefinedTypeNode,
  type TypeBaseNode,
} from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import type { AnalysisContext } from '../classes/AnalysisContext';
import { KinaSemanticAnalyzer } from '../classes/KinaSemanticAnalyzer';
import type { Scope } from '../classes/Scope';
import { ExternSymbol } from '../classes/symbols/ExternSymbol';
import { FunctionSymbol } from '../classes/symbols/FunctionSymbol';
import { ImportedFunctionSymbol } from '../classes/symbols/ImportedFunctionSymbol';
import type { StructSymbol } from '../classes/symbols/StructSymbol';
import { SymbolKind } from '../types/symbol';
import {
  getUserDefinedTypeName,
  isUserDefinedTypeKind,
  makeUserDefinedTypeKind,
  type KinaTypeTokenKind,
} from '../types/type';

export function resolveASTType(node: TypeBaseNode): KinaTypeTokenKind {
  if (node instanceof PrimitiveTypeNode)
    return node.primitiveKind as KinaTypeTokenKind;

  if (node instanceof UserDefinedTypeNode)
    return makeUserDefinedTypeKind(node.identifier.name);

  if (node instanceof FunctionTypeNode) return TokenKind.TypePtr; // Function types are represented as pointers in the type system

  throw new KinaAssertionError(`Unknown type node kind: ${node.kind}`);
}

export function getFunctionSignature(
  callee: BaseNode,
  scope: Scope,
  context: AnalysisContext,
): {
  parameterTypes: KinaTypeTokenKind[];
  returnType: KinaTypeTokenKind;
} | null {
  if (callee.kind === NodeKind.IdentifierExpression) {
    const symbol = scope.lookup((callee as IdentifierExpressionNode).name);
    if (symbol === null) return null;

    if (
      symbol instanceof FunctionSymbol ||
      symbol instanceof ExternSymbol ||
      symbol instanceof ImportedFunctionSymbol
    )
      return {
        parameterTypes: symbol.parameterTypes,
        returnType: symbol.returnType,
      };
  }

  if (callee.kind === NodeKind.MemberAccessExpression) {
    const memberAccess = callee as MemberAccessExpressionNode;
    const objectType = KinaSemanticAnalyzer.checkExpression(
      memberAccess.object,
      scope,
      context,
    );

    if (!isUserDefinedTypeKind(objectType)) return null;

    const typeName = getUserDefinedTypeName(objectType);
    const typeSymbol = scope.lookup(typeName!);
    if (typeSymbol === null) return null;
    if (typeSymbol.kind !== SymbolKind.Struct) return null;

    const structSymbol = typeSymbol as StructSymbol;
    const field = structSymbol.fields.find(
      (f) => f.name === memberAccess.property,
    );
    if (!field) return null;
    if (!(field.type instanceof FunctionTypeNode)) return null;

    const funcTypeNode = field.type as FunctionTypeNode;
    const parameterTypes = funcTypeNode.parameters.map((param) =>
      resolveASTType(param),
    );
    const returnType = resolveASTType(funcTypeNode.returnType);

    return {
      parameterTypes,
      returnType,
    };
  }

  return null;
}

export function validateSignatureAssignment(
  expectedTypeNode: TypeBaseNode | null,
  actualValueNode: BaseNode,
  scope: Scope,
  context: AnalysisContext,
) {
  if (!expectedTypeNode) return;
  if (!(expectedTypeNode instanceof FunctionTypeNode)) return;

  const expectedParameterTypes = expectedTypeNode.parameters.map((p) =>
    resolveASTType(p),
  );
  const expectedReturnType = resolveASTType(expectedTypeNode.returnType);

  const actualSignature = getFunctionSignature(actualValueNode, scope, context);
  if (!actualSignature)
    throw new KinaAssertionError(
      `Expected a function signature for the actual value node, but got null.`,
    );
  if (actualSignature.parameterTypes.length !== expectedParameterTypes.length)
    throw new KinaSemanticError(
      `Parameter count mismatch: expected ${expectedParameterTypes.length}, got ${actualSignature.parameterTypes.length}.`,
    );

  for (let i = 0; i < expectedParameterTypes.length; i++) {
    if (expectedParameterTypes[i] !== actualSignature.parameterTypes[i])
      throw new KinaSemanticError(
        `Parameter type mismatch at index ${i}: expected ${expectedParameterTypes[i]}, got ${actualSignature.parameterTypes[i]}.`,
      );
  }

  if (expectedReturnType !== actualSignature.returnType)
    throw new KinaSemanticError(
      `Return type mismatch: expected ${expectedReturnType}, got ${actualSignature.returnType}.`,
    );
}
