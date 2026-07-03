import type { ExternNode } from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import { ExternSymbol } from '../symbols/ExternSymbol';

export class ExternChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: ExternNode, scope: Scope, ctx: AnalysisContext) {
    // TODO: Check if extern exists in one of the linked files (if any) and if the signature matches
  }

  override firstPass(
    node: ExternNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {
    if (scope.existsInCurrentScope(node.name))
      throw new KinaSemanticError(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const symbol = new ExternSymbol(
      node,
      node.name,
      node.parameterTypes,
      node.returnType,
    );
    scope.define(node.name, symbol);
  }
}
