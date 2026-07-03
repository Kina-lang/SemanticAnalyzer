import type { IdentifierExpressionNode } from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import { SymbolKind } from '../../../types/symbol';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import type { Scope } from '../../Scope';
import type { FunctionParameterSymbol } from '../../symbols/FunctionParameterSymbol';
import type { VariableSymbol } from '../../symbols/VariableSymbol';

export class IdentifierExpressionChecker extends ExpressionChecker {
  constructor() {
    super();
  }

  override check(
    node: IdentifierExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const symbol = scope.lookup(node.name);
    if (symbol === null)
      throw new KinaSemanticError(`${node.name} is not defined.`);

    // TODO: Add support
    if (
      symbol.kind !== SymbolKind.Variable &&
      symbol.kind !== SymbolKind.Parameter
    )
      throw new KinaSemanticError(
        `Identifier ${node.name} is a ${symbol.kind.toLowerCase()} and cannot be used as an expression (for now).`,
      );

    return (symbol as VariableSymbol | FunctionParameterSymbol).type;
  }
}
