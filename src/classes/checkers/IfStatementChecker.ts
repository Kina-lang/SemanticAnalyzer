import type { BaseNode, IfStatementNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class IfStatementChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(
    node: IfStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    this.checkCondition(node, scope, ctx);
    this.checkThenBlock(node, scope, ctx);
    this.checkElseBlock(node, scope, ctx);
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private checkCondition(
    node: IfStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    const conditionType = KinaSemanticAnalyzer.checkExpression(
      node.condition,
      scope,
      ctx,
      TokenKind.TypeBool,
    );

    if (conditionType !== TokenKind.TypeBool)
      throw new KinaSemanticError(
        `Condition expression must be of type 'bool', but got '${conditionType}'.`,
      );
  }

  private checkThenBlock(
    node: IfStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    KinaSemanticAnalyzer.checkNode(node.thenBlock, scope, ctx);
  }

  private checkElseBlock(
    node: IfStatementNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    if (node.elseBlock !== null) {
      KinaSemanticAnalyzer.checkNode(node.elseBlock, scope, ctx);
    }
  }
}
