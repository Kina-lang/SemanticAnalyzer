import type { BaseNode, ExpressionStatementNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class ExpressionStatementChecker extends BaseChecker {
  constructor() {
    super();
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): void {}

  override check(
    node: ExpressionStatementNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {
    // We basically only need to check the expression
    KinaSemanticAnalyzer.checkExpression(node.expression, scope, context);
  }
}
