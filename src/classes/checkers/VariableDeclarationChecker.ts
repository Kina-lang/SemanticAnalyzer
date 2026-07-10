import type {
  BaseNode,
  VariableDeclarationStatementNode,
} from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';
import {
  getUserDefinedTypeName,
  isUserDefinedTypeKind,
} from '../../types/type';
import { resolveASTType, validateSignatureAssignment } from '../../utils/type';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';
import { VariableSymbol } from '../symbols/VariableSymbol';

export class VariableDeclarationChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(
    node: VariableDeclarationStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    if (scope.existsInCurrentScope(node.name))
      throw new Error(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const resolvedType = resolveASTType(node.type);

    // Validate that user-defined types are actually defined in scope
    if (isUserDefinedTypeKind(resolvedType)) {
      const typeName = getUserDefinedTypeName(resolvedType)!;
      const typeSymbol = scope.lookup(typeName);

      if (typeSymbol === null)
        throw new KinaSemanticError(`Type '${typeName}' is not defined.`);
      if (typeSymbol.kind !== SymbolKind.Struct)
        throw new KinaSemanticError(
          `'${typeName}' is a ${typeSymbol.kind.toLowerCase()}, not a type.`,
        );
    }

    const symbol = new VariableSymbol(
      node,
      node.name,
      resolvedType,
      node.isMutable,
    );
    scope.define(node.name, symbol);

    const wantedType = resolvedType;
    const initializerType = this.checkInitializer(node, scope, ctx, wantedType);

    if (wantedType !== null && initializerType !== wantedType)
      throw new KinaSemanticError(
        `Type mismatch: expected '${wantedType}', but got '${initializerType}'.`,
      );

    validateSignatureAssignment(node.type, node.value, scope, ctx);
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): void {}

  private checkInitializer(
    node: VariableDeclarationStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    const expression = node.value;
    const type = KinaSemanticAnalyzer.checkExpression(
      expression,
      scope,
      ctx,
      wantedType,
    );

    return type;
  }
}
