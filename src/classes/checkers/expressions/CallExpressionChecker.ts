import { NodeKind, type CallExpressionNode } from '@kina-lang/ast';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import type { Scope } from '../../Scope';
import { ExternSymbol } from '../../symbols/ExternSymbol';
import { FunctionSymbol } from '../../symbols/FunctionSymbol';

export class CallExpressionChecker extends ExpressionChecker {
  constructor() {
    super();
  }

  override check(
    node: CallExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    const callee = node.callee;

    // TODO: Delegate this back to the expression checker
    //       to check via function signatures (once we have them)
    if (callee.kind !== NodeKind.IdentifierExpression)
      throw new KinaAssertionError(
        'Callee of a call expression must be an identifier expression (for now).',
      );

    const symbol = scope.lookup((callee as any).name);
    if (symbol === null)
      throw new KinaSemanticError(`${(callee as any).name} is not defined.`);

    // TODO: Add support for checking signatures to allow calling
    //       even variables for example, if they are of function type (once we have function types)
    if (!(symbol instanceof FunctionSymbol || symbol instanceof ExternSymbol))
      throw new KinaSemanticError(
        'Callee of a call expression must be a function or an extern.',
      );

    // TODO: Check parameter types

    return symbol.returnType;
  }
}
