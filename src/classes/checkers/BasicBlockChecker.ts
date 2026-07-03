import type { BasicBlockNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import { Scope } from '../Scope';
import { BasicBlockSymbol } from '../symbols/BasicBlockSymbol';

export class BasicBlockChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(
    node: BasicBlockNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    const bbScope = new Scope(scope);

    const bbSymbol = new BasicBlockSymbol(node, bbScope);
    scope.define(node.name, bbSymbol);

    KinaSemanticAnalyzer.checkNodes(node.nodes, bbScope, ctx);
  }
}
