import type { VariableDeclarationStatementNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
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

    // TODO: Add right side expression checking here
  }
}
