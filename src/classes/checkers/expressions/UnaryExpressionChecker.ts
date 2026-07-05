import { BaseNode, UnaryExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';

export class UnaryExpressionChecker extends ExpressionChecker {
  /**
   * Set of types that are valid for integer literals.
   */
  private readonly _integerLiteralTypes: Set<KinaTypeTokenKind> = new Set([
    TokenKind.TypeInt,
  ]);

  constructor() {
    super();
  }

  override check(
    node: UnaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    switch (node.operator) {
      case '+':
      case '-':
        return this.checkMathOperation(node, scope, context, wantedType);
      case '!':
        return this.checkLogicalNotOperation(node, scope, context, wantedType);
      default:
        throw new KinaAssertionError(
          'Unknown unary operator: ' + node.operator,
        );
    }
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private checkMathOperation(
    node: UnaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const rightType = KinaSemanticAnalyzer.checkExpression(
      node.right,
      scope,
      context,
      wantedType,
    );

    if (!this._integerLiteralTypes.has(rightType))
      throw new KinaSemanticError(
        `Type mismatch in unary operation: operand is '${rightType}'.`,
      );

    return rightType;
  }

  private checkLogicalNotOperation(
    node: UnaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const rightType = KinaSemanticAnalyzer.checkExpression(
      node.right,
      scope,
      context,
      wantedType,
    );

    if (rightType !== TokenKind.TypeBool)
      throw new KinaSemanticError(
        `Type mismatch in logical not operation: operand is '${rightType}'.`,
      );

    return TokenKind.TypeBool;
  }
}
