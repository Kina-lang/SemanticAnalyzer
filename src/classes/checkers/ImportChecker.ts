import path from 'path';
import type { ImportNode } from '@kina-lang/ast/src/classes/nodes/Import';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import { ImportedFunctionSymbol } from '../symbols/ImportedFunctionSymbol';

export class ImportChecker extends BaseChecker {
  constructor() {
    super();
  }

  override firstPass(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {
    if (!node.isExtern)
      throw new KinaAssertionError(
        'Importing non-external modules is not supported yet.',
      );

    const filePath = context.compiler.resolveIncludePath(
      node.source.value,
      context.filePath,
    );

    if (path.extname(filePath) !== '.c')
      throw new KinaAssertionError('Only C files can be imported.');

    const symbols = context.compiler.getCSymbols(filePath);

    for (const identifier of node.members) {
      const functionName = identifier.name;

      const symbolInfo = symbols[functionName];
      if (!symbolInfo)
        throw new KinaSemanticError(
          `Function ${functionName} not found in ${filePath}`,
        );

      const importedFunctionSymbol = new ImportedFunctionSymbol(
        identifier,
        functionName,
        symbolInfo.parameterTypes,
        symbolInfo.returnType,
      );

      scope.define(functionName, importedFunctionSymbol);

      context.compiler.includeFile(filePath);
    }
  }

  override check(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}
}
