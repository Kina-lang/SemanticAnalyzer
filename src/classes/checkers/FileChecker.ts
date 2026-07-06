import type { FileNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class FileChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: FileNode, scope: Scope, ctx: AnalysisContext) {
    for (const subNode of node.nodes) {
      KinaSemanticAnalyzer.checkNode(subNode, scope, ctx);
    }
  }

  override async firstPass(
    node: FileNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    for (const subNode of node.nodes) {
      await KinaSemanticAnalyzer.firstPassNode(subNode, scope, context);
    }
  }
}
