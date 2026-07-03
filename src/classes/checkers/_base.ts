import type { BaseNode } from '@kina-lang/ast';

import type { KinaTypeTokenKind } from '../../types/type';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';

export abstract class BaseChecker {
  abstract check(node: BaseNode, scope: Scope, context: AnalysisContext): void;
}

export abstract class ExpressionChecker extends BaseChecker {
  abstract override check(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind;
}
