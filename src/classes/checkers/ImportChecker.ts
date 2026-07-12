import path from 'path';
import type { IdentifierExpressionNode } from '@kina-lang/ast';
import type { ImportNode } from '@kina-lang/ast/src/classes/nodes/Import';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import { SymbolKind } from '../../types/symbol';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import type { FunctionSymbol } from '../symbols/FunctionSymbol';
import { ImportedFunctionSymbol } from '../symbols/ImportedFunctionSymbol';
import { ImportedVariableSymbol } from '../symbols/ImportedVariableSymbol';
import { VariableSymbol } from '../symbols/VariableSymbol';

export class ImportChecker extends BaseChecker {
  constructor() {
    super();
  }

  override async firstPass(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): Promise<void> {
    if (meta && meta.isExported == true)
      throw new KinaSemanticError('Imports cannot be exported');

    if (node.isExtern) await this.processExternImport(node, scope, context);
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
    const filePath = context.compiler.pathResolver.resolveNamespacedPath(
      node.source.value,
      context.filePath,
    );

    const { scope: importScope } = await context.compiler.compileIncluded(
      filePath,
      context.filePath,
    );

    for (const identifier of node.members) {
      this.processImportedSymbol(identifier, importScope, scope, filePath);
    }
  }

  private async processLocalImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    const filePath = context.compiler.pathResolver.resolveIncludePath(
      node.source.value,
      context.filePath,
    );

    const { scope: importScope } = await context.compiler.compileIncluded(
      filePath,
      context.filePath,
    );

    for (const identifier of node.members) {
      this.processImportedSymbol(identifier, importScope, scope, filePath);
    }
  }

  private processImportedSymbol(
    identifier: IdentifierExpressionNode,
    importScope: Scope,
    scope: Scope,
    filePath: string,
  ): void {
    const name = identifier.name;
    const symbol = importScope.lookup(name, true);

    if (!symbol)
      throw new KinaSemanticError(`Symbol ${name} not found in ${filePath}`);

    if (symbol.kind === SymbolKind.Function) {
      const fnSymbol = symbol as FunctionSymbol;
      const importedFunctionSymbol = new ImportedFunctionSymbol(
        identifier,
        fnSymbol.mangledName,
        fnSymbol.parameterTypes,
        fnSymbol.returnType,
      );

      scope.define(name, importedFunctionSymbol);

      // Auto-import UDT types from function signature
      const typesToCheck = [fnSymbol.returnType, ...fnSymbol.parameterTypes];
      for (const type of typesToCheck) {
        if (!(typeof type === 'string' && type.startsWith('udt.'))) continue;

        const structName = type.slice(4);
        const structSymbol = importScope.lookup(structName, true);

        if (!structSymbol || structSymbol.kind !== SymbolKind.Struct) continue;
        if (scope.existsInCurrentScope(structName)) continue;

        // Symbol was already checked in the imported file, so we can safely add it to the current scope
        scope.define(structName, structSymbol);
      }
    } else if (symbol.kind === SymbolKind.Variable) {
      const varSymbol = symbol as VariableSymbol;
      const importedVariableSymbol = new ImportedVariableSymbol(
        identifier,
        varSymbol.mangledName,
        varSymbol.type,
        varSymbol.isMutable,
      );
      scope.define(name, importedVariableSymbol);

      // Auto-import the struct type if the variable has a UDT type
      if (
        typeof varSymbol.type !== 'string' ||
        !varSymbol.type.startsWith('udt.')
      )
        return;

      const structName = varSymbol.type.slice(4);
      const structSymbol = importScope.lookup(structName, true);

      if (!structSymbol || structSymbol.kind !== SymbolKind.Struct) return;
      if (scope.existsInCurrentScope(structName)) return;

      // Symbol was already checked in the imported file, so we can safely add it to the current scope
      scope.define(structName, structSymbol);
    } else if (symbol.kind === SymbolKind.Struct) scope.define(name, symbol);
    else
      throw new KinaSemanticError(
        `Importing symbol kind '${symbol.kind}' is not supported.`,
      );
  }

  private async processExternImport(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): Promise<void> {
    const filePath = context.compiler.pathResolver.resolveIncludePath(
      node.source.value,
      context.filePath,
    );

    if (path.extname(filePath) !== '.c')
      throw new KinaAssertionError(
        'Only C files can be imported using extern.',
      );

    const symbols = context.compiler.cSymbols.get(filePath);

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

      await context.compiler.compileIncludedC(filePath, context.filePath);
    }
  }

  override check(
    node: ImportNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}
}
