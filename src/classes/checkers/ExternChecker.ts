import type { ExternNode } from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { IAnalysisMeta } from '../../types/meta';
import { SymbolKind } from '../../types/symbol';
import {
  getUserDefinedTypeName,
  isUserDefinedTypeKind,
} from '../../types/type';
import { resolveASTType } from '../../utils/type';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import { ExternSymbol } from '../symbols/ExternSymbol';

export class ExternChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: ExternNode, scope: Scope, ctx: AnalysisContext) {
    // TODO: Check if extern exists in one of the linked files (if any) and if the signature matches
  }

  override firstPass(
    node: ExternNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): void {
    if (meta && meta.isExported == true)
      throw new KinaSemanticError('Externs cannot be exported');

    if (scope.existsInCurrentScope(node.name))
      throw new KinaSemanticError(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const resolvedParameterTypes = node.parameterTypes.map(resolveASTType);
    const resolvedReturnType = resolveASTType(node.returnType);

    for (const paramType of resolvedParameterTypes) {
      if (isUserDefinedTypeKind(paramType)) {
        const typeName = getUserDefinedTypeName(paramType)!;
        const typeSymbol = scope.lookup(typeName);

        if (typeSymbol === null)
          throw new KinaSemanticError(`Type '${typeName}' is not defined.`);
        if (typeSymbol.kind !== SymbolKind.Struct)
          throw new KinaSemanticError(
            `'${typeName}' is a ${typeSymbol.kind.toLowerCase()}, not a type.`,
          );
      }
    }

    if (isUserDefinedTypeKind(resolvedReturnType)) {
      const typeName = getUserDefinedTypeName(resolvedReturnType)!;
      const typeSymbol = scope.lookup(typeName);

      if (typeSymbol === null)
        throw new KinaSemanticError(`Type '${typeName}' is not defined.`);
      if (typeSymbol.kind !== SymbolKind.Struct)
        throw new KinaSemanticError(
          `'${typeName}' is a ${typeSymbol.kind.toLowerCase()}, not a type.`,
        );
    }

    const symbol = new ExternSymbol(
      node,
      node.name,
      resolvedParameterTypes,
      resolvedReturnType,
    );
    scope.define(node.name, symbol);
  }
}
