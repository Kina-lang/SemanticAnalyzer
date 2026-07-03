import type { VariableDeclarationStatementNode } from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { KinaTypeTokenKind } from '../../types/type';
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

    const symbol = new VariableSymbol(
      node,
      node.name,
      node.type,
      node.isMutable,
    );
    scope.define(node.name, symbol);

    const wantedType = node.type ?? null;
    const initializerType = this.checkInitializer(node, scope, ctx, wantedType);

    if (wantedType !== null && initializerType !== wantedType)
      throw new KinaSemanticError(
        `Type mismatch: expected '${wantedType}', but got '${initializerType}'.`,
      );
  }

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
