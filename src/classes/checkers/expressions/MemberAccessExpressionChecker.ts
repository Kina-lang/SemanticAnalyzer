import type { BaseNode, MemberAccessExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { IAnalysisMeta } from '../../../types/meta';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';

export class MemberAccessExpressionChecker extends ExpressionChecker {
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
    node: MemberAccessExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const objectType = KinaSemanticAnalyzer.checkExpression(
      node.object,
      scope,
      context,
    );

    if (objectType === TokenKind.TypeString) {
      if (node.property === '___kina_internal') {
        return '___kina_internal_string' as KinaTypeTokenKind;
      }

      throw new KinaSemanticError(
        `Property '${node.property}' does not exist on type 'string'.`,
      );
    }

    if (objectType === '___kina_internal_string') {
      if (node.property === 'length') return TokenKind.TypeInt;
      if (node.property === 'pointer') return TokenKind.TypePtr;

      throw new KinaSemanticError(
        `Property '${node.property}' does not exist on '___kina_internal_string'.`,
      );
    }

    throw new KinaSemanticError(
      `Member access is not supported on type '${objectType}'.`,
    );
  }
}
