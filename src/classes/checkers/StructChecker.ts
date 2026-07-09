import { StructNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import type { AnalysisContext } from '../AnalysisContext';
import { Scope } from '../Scope';
import { StructSymbol } from '../symbols/StructSymbol';

export class StructChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: StructNode, scope: Scope, ctx: AnalysisContext): void {}

  override firstPass(
    node: StructNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): void {
    if (scope.existsInCurrentScope(node.name))
      throw new Error(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const structSymbol = new StructSymbol(
      node,
      node.name,
      node.fields,
      meta?.isExported ?? false,
    );

    scope.define(node.name, structSymbol);
  }
}
