import type { BasicBlockNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import { Scope } from '../Scope';

export class BasicBlockChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: BasicBlockNode, scope: Scope): void {
    const bbScope = new Scope(scope);

    KinaSemanticAnalyzer.checkNodes(node.nodes, bbScope);
  }
}
