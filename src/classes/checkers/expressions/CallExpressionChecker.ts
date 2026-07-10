import { BaseNode, type CallExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import { type KinaTypeTokenKind } from '../../../types/type';
import { getFunctionSignature } from '../../../utils/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';

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

    const signature = getFunctionSignature(callee, scope, context);
    if (signature) {
      this.checkParameters(node, signature.parameterTypes, scope, context);
      return signature.returnType;
    }

    const calleeType = KinaSemanticAnalyzer.checkExpression(
      callee,
      scope,
      context,
    );
    if (calleeType !== TokenKind.TypePtr)
      throw new KinaSemanticError(
        'Callee of a call expression must be a function pointer.',
      );

    // TODO: Add call parameter signature checking

    return wantedType ?? TokenKind.TypeVoid;
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private checkParameters(
    node: CallExpressionNode,
    expectedParameterTypes: KinaTypeTokenKind[],
    scope: Scope,
    context: AnalysisContext,
  ) {
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
