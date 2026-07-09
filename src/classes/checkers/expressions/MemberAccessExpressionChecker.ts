import type { BaseNode, MemberAccessExpressionNode } from '@kina-lang/ast';
import { TokenKind } from '@kina-lang/lexer';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import type { IAnalysisMeta } from '../../../types/meta';
import type { KinaTypeTokenKind } from '../../../types/type';
import { isUserDefinedTypeKind, getUserDefinedTypeName } from '../../../types/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';
import { SymbolKind } from '../../../types/symbol';
import { StructSymbol } from '../../symbols/StructSymbol';
import { resolveASTType } from '../../../utils/type';

export class MemberAccessExpressionChecker extends ExpressionChecker {
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
    node: MemberAccessExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType?: KinaTypeTokenKind | null,
  ): KinaTypeTokenKind {
    const objectType = KinaSemanticAnalyzer.checkExpression(
      node.object,
      scope,
      context,
    );

    if (objectType === TokenKind.TypeString) {
      if (node.property === '___kina_internal') {
        return '___kina_internal_string' as KinaTypeTokenKind;
      }

      throw new KinaSemanticError(
        `Property '${node.property}' does not exist on type 'string'.`,
      );
    }

    if (objectType === '___kina_internal_string') {
      if (node.property === 'length') return TokenKind.TypeInt;
      if (node.property === 'pointer') return TokenKind.TypePtr;

      throw new KinaSemanticError(
        `Property '${node.property}' does not exist on '___kina_internal_string'.`,
      );
    }

    if (isUserDefinedTypeKind(objectType)) {
      const typeName = getUserDefinedTypeName(objectType)!;
      const typeSymbol = scope.lookup(typeName);

      if (typeSymbol === null)
        throw new KinaSemanticError(`Type '${typeName}' is not defined.`);

      if (typeSymbol.kind !== SymbolKind.Struct)
        throw new KinaSemanticError(
          `'${typeName}' is a ${typeSymbol.kind.toLowerCase()}, not a struct type.`,
        );

      const structSymbol = typeSymbol as StructSymbol;
      const field = structSymbol.fields.find((f) => f.name === node.property);

      if (!field)
        throw new KinaSemanticError(
          `Property '${node.property}' does not exist on struct '${typeName}'.`,
        );

      return resolveASTType(field.type);
    }

    throw new KinaSemanticError(
      `Member access is not supported on type '${objectType}'.`,
    );
  }
}
