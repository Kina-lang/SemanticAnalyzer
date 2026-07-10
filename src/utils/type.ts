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
import { KinaAssertionError } from '@kina-lang/utils';

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
