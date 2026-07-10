import type { BaseNode, ReturnStatementNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import type { KinaTypeTokenKind } from '../../types/type';
import { validateSignatureAssignment } from '../../utils/type';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class ReturnStatementChecker extends BaseChecker {
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
    node: ReturnStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    const expectedReturnType = ctx.getExpectedReturnType();
    if (expectedReturnType === null)
      throw new KinaSemanticError(
        'Return statement is not allowed outside of a function.',
      );

    let actualReturnType: KinaTypeTokenKind;
    if (node.value === null) {
      // There is no expression -> treat that as void
      actualReturnType = TokenKind.TypeVoid;
    } else {
      actualReturnType = KinaSemanticAnalyzer.checkExpression(
        node.value,
        scope,
        ctx,
        expectedReturnType,
      );
    }

    if (actualReturnType !== expectedReturnType)
      throw new KinaSemanticError(
        `Return type mismatch: expected '${expectedReturnType}', but got '${actualReturnType}'.`,
      );

    if (node.value !== null)
      validateSignatureAssignment(
        ctx.getExpectedReturnASTNode(),
        node.value,
        scope,
        ctx,
      );
  }
}
