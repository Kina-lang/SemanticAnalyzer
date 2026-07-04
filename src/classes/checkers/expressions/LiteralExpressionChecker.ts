import type { BaseNode, LiteralExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaAssertionError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import type { Scope } from '../../Scope';

export class LiteralExpressionChecker extends ExpressionChecker {
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
    node: LiteralExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    switch (node.literalType) {
      case TokenKind.LiteralInteger:
        return this.getIntegerLiteralType(node, scope, context, wantedType);
      case TokenKind.LiteralBoolean:
        return this.getBooleanLiteralType(node, scope, context, wantedType);
      default:
        throw new KinaAssertionError(
          `Unknown literal type: ${node.literalType}`,
        );
    }
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private getIntegerLiteralType(
    node: LiteralExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    // Make it be the wanted type, or int32 if no wanted type is specified or if the wanted type is not valid for integer literals.
    if (wantedType === null) return TokenKind.TypeInt;
    if (!this._integerLiteralTypes.has(wantedType)) return TokenKind.TypeInt;

    // TODO: Add checking and casting with account for the integer size
    //       so that we cast into type with more bytes, if it can't fit into the
    //       fallback (BUT NOT the wanted type!)

    return wantedType;
  }

  private getBooleanLiteralType(
    node: LiteralExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    // TODO: Add casting into numbers?
    return TokenKind.TypeBool;
  }
}
