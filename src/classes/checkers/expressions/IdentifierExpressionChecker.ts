import type { BaseNode, IdentifierExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { IAnalysisMeta } from '../../../types/meta';
import { SymbolKind } from '../../../types/symbol';
import type { KinaTypeTokenKind } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import type { Scope } from '../../Scope';
import type { FunctionParameterSymbol } from '../../symbols/FunctionParameterSymbol';
import type { VariableSymbol } from '../../symbols/VariableSymbol';
import type { ImportedVariableSymbol } from '../../symbols/ImportedVariableSymbol';

export class IdentifierExpressionChecker extends ExpressionChecker {
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
      symbol.kind !== SymbolKind.ImportedVariable &&
      symbol.kind !== SymbolKind.FunctionParameter &&
      symbol.kind !== SymbolKind.Function &&
      symbol.kind !== SymbolKind.ImportedFunction &&
      symbol.kind !== SymbolKind.Extern
    )
      throw new KinaSemanticError(
        `Identifier ${node.name} is a ${symbol.kind.toLowerCase()} and cannot be used as an expression (for now).`,
      );

    if (
      symbol.kind === SymbolKind.Function ||
      symbol.kind === SymbolKind.Extern ||
      symbol.kind === SymbolKind.ImportedFunction
    )
      return TokenKind.TypePtr;

    return (symbol as VariableSymbol | ImportedVariableSymbol | FunctionParameterSymbol).type;
  }
}
