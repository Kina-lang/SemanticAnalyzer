import { BaseNode, NodeKind, type CallExpressionNode } from '@kina-lang/ast';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
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

    this.checkParameters(node, symbol, scope, context);

    return symbol.returnType;
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private checkParameters(
    node: CallExpressionNode,
    symbol: FunctionSymbol | ExternSymbol,
    scope: Scope,
    context: AnalysisContext,
  ) {
    const expectedParameterTypes = symbol.parameterTypes;
    const actualParameterTypes = node.arguments.map((arg, i) =>
      KinaSemanticAnalyzer.checkExpression(
        arg,
        scope,
        context,
        expectedParameterTypes[i] ?? null,
      ),
    );

    if (actualParameterTypes.length !== expectedParameterTypes.length)
      throw new KinaSemanticError(
        `Expected ${expectedParameterTypes.length} arguments, but got ${actualParameterTypes.length}.`,
      );

    for (let i = 0; i < expectedParameterTypes.length; i++) {
      const expectedType = expectedParameterTypes[i];
      const actualType = actualParameterTypes[i];

      if (actualType !== expectedType)
        throw new KinaSemanticError(
          `Argument ${i + 1} has type ${actualType}, but expected ${expectedType}.`,
        );
    }
  }
}
