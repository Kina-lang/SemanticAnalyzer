import path from 'path';
import type { ImportNode } from '@kina-lang/ast/src/classes/nodes/Import';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import type { FunctionSymbol } from '../symbols/FunctionSymbol';
import { ImportedFunctionSymbol } from '../symbols/ImportedFunctionSymbol';

export class ImportChecker extends BaseChecker {
  constructor() {
    super();
  }

  override async firstPass(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    if (node.isExtern) this.processExternImport(node, scope, context);
    else await this.processRegularImport(node, scope, context);
  }

  private async processRegularImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    if (node.source.value.startsWith('.') || node.source.value.startsWith('..'))
      await this.processLocalImport(node, scope, context);
    else await this.processNamespacedImport(node, scope, context);
  }

  private async processNamespacedImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    const filePath = context.compiler.resolveNamespacedPath(
      node.source.value,
      context.filePath,
    );

    const { scope: importScope } = await context.compiler.compileIncludedFile(
      filePath,
      context.filePath,
    );

    for (const identifier of node.members) {
      const functionName = identifier.name;

      const symbolInfo = importScope.lookup(functionName) as FunctionSymbol;
      if (!symbolInfo)
        throw new KinaSemanticError(
          `Function ${functionName} not found in ${filePath}`,
        );

      const importedFunctionSymbol = new ImportedFunctionSymbol(
        identifier,
        symbolInfo.mangledName,
        symbolInfo.parameterTypes,
        symbolInfo.returnType,
      );

      scope.define(functionName, importedFunctionSymbol);
    }
  }

  private async processLocalImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    const filePath = context.compiler.resolveIncludePath(
      node.source.value,
      context.filePath,
    );

    const { scope: importScope } = await context.compiler.compileIncludedFile(
      filePath,
      context.filePath,
    );

    for (const identifier of node.members) {
      const functionName = identifier.name;

      const symbolInfo = importScope.lookup(functionName) as FunctionSymbol;
      if (!symbolInfo)
        throw new KinaSemanticError(
          `Function ${functionName} not found in ${filePath}`,
        );

      const importedFunctionSymbol = new ImportedFunctionSymbol(
        identifier,
        symbolInfo.mangledName,
        symbolInfo.parameterTypes,
        symbolInfo.returnType,
      );

      scope.define(functionName, importedFunctionSymbol);
    }
  }

  private processExternImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {
    const filePath = context.compiler.resolveIncludePath(
      node.source.value,
      context.filePath,
    );

    if (path.extname(filePath) !== '.c')
      throw new KinaAssertionError(
        'Only C files can be imported using extern.',
      );

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
