import type { BaseNode, ExportNode } from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class ExportChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(
    node: ExportNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {
    KinaSemanticAnalyzer.checkNode(node.target, scope, context);
  }

  override async firstPass(
    node: ExportNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): Promise<void> {
    if (meta && meta.isExported == true)
      throw new KinaSemanticError('Node is already exported');

    await KinaSemanticAnalyzer.firstPassNode(node.target, scope, context, {
      isExported: true,
    });
  }
}
