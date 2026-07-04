import {
  BaseNode,
  IdentifierExpressionNode,
  NodeKind,
  type BinaryExpressionNode,
} from '@kina-lang/ast';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import { SymbolKind } from '../../../types/symbol';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';
import type { FunctionParameterSymbol } from '../../symbols/FunctionParameterSymbol';
import type { VariableSymbol } from '../../symbols/VariableSymbol';

export class BinaryExpressionChecker extends ExpressionChecker {
  constructor() {
    super();
  }

  override check(
    node: BinaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    switch (node.operator) {
      case '=':
        return this.checkAssignment(node, scope, context, wantedType);
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        return this.checkMathOperation(node, scope, context, wantedType);
      default:
        throw new KinaAssertionError(
          'Unknown binary operator: ' + node.operator,
        );
    }
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  private checkMathOperation(
    node: BinaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const leftType = KinaSemanticAnalyzer.checkExpression(
      node.left,
      scope,
      context,
      wantedType,
    );
    const rightType = KinaSemanticAnalyzer.checkExpression(
      node.right,
      scope,
      context,
      wantedType,
    );

    if (leftType !== rightType)
      throw new KinaSemanticError(
        `Type mismatch in binary operation: left side is '${leftType}', right side is '${rightType}'.`,
      );

    return leftType;
  }

  private checkAssignment(
    node: BinaryExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const leftSide = node.left;
    const rightSide = node.right;

    // TODO: Add broader support
    if (leftSide.kind !== NodeKind.IdentifierExpression)
      throw new KinaSemanticError(
        'Left side of assignment must be an identifier.',
      );

    const leftSymbol = scope.lookup(
      (leftSide as IdentifierExpressionNode).name,
    );
    if (!leftSymbol)
      throw new KinaSemanticError(
        `'${(leftSide as IdentifierExpressionNode).name}' is not defined.`,
      );

    // TODO: Add broader support
    if (
      leftSymbol.kind !== SymbolKind.Variable &&
      leftSymbol.kind !== SymbolKind.FunctionParameter
    )
      throw new KinaSemanticError(
        `'${(leftSide as IdentifierExpressionNode).name}' is not a variable or function parameter.`,
      );

    const expectedType = (
      leftSymbol as VariableSymbol | FunctionParameterSymbol
    ).type;

    const actualType = KinaSemanticAnalyzer.checkExpression(
      rightSide,
      scope,
      context,
      expectedType,
    );

    if (actualType !== expectedType)
      throw new KinaSemanticError(
        `Type mismatch: expected '${expectedType}', but got '${actualType}'.`,
      );

    // TODO: Add support for mutability checks. For now, we will assume that function parameters are immutable.
    if (leftSymbol.kind === SymbolKind.FunctionParameter)
      throw new KinaSemanticError(
        `Cannot assign to function parameter '${leftSymbol.name}'. Function parameters are immutable (for now).`,
      );

    if (!(leftSymbol as VariableSymbol).isMutable)
      throw new KinaSemanticError(
        `Cannot assign to variable '${leftSymbol.name}', because it is not mutable. Use 'mut' to declare a mutable variable.`,
      );

    return expectedType;
  }
}
