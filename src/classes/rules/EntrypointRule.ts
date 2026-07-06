import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseRule } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import type { FunctionSymbol } from '../symbols/FunctionSymbol';

export class EntrypointRule extends BaseRule {
  constructor() {
    super();
  }

  override validate(
    scope: Scope,
    context: AnalysisContext,
    isIncluded: boolean,
  ): void {
    if (isIncluded) return;

    if (!scope.existsInCurrentScope('main'))
      throw new KinaSemanticError("No entrypoint function 'main' found.");

    const symbol = scope.lookup('main');
    if (symbol === null)
      throw new KinaSemanticError("No entrypoint function 'main' found.");

    if (symbol.kind !== SymbolKind.Function)
      throw new KinaSemanticError("Entrypoint 'main' is not a function.");

    if ((symbol as FunctionSymbol).parameterSymbols.length > 0)
      throw new KinaSemanticError(
        "Entrypoint 'main' function must not have any parameters.",
      );

    if ((symbol as FunctionSymbol).returnType !== TokenKind.TypeInt)
      throw new KinaSemanticError(
        "Entrypoint 'main' function must have a return type of 'int'.",
      );
  }
}
