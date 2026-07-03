import type { GroupExpressionNode } from '@kina-lang/ast';

import { ExpressionChecker } from '../_base';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';

export class GroupExpressionChecker extends ExpressionChecker {
  constructor() {
    super();
  }

  override check(
    node: GroupExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    // Just hand off to check the inner expression, since the group expression doesn't change the type.
    return KinaSemanticAnalyzer.checkExpression(
      node.expression,
      scope,
      context,
      wantedType,
    );
  }
}
