import {
  type BaseNode,
  type StructLiteralExpressionNode,
} from '@kina-lang/ast';
import { KinaSemanticError } from '@kina-lang/utils';

import { ExpressionChecker } from '../_base';
import { SymbolKind } from '../../../types/symbol';
import type { KinaTypeTokenKind } from '../../../types/type';
import {
  getUserDefinedTypeName,
  isUserDefinedTypeKind,
} from '../../../types/type';
import {
  resolveASTType,
  validateSignatureAssignment,
} from '../../../utils/type';
import type { AnalysisContext } from '../../AnalysisContext';
import { KinaSemanticAnalyzer } from '../../KinaSemanticAnalyzer';
import type { Scope } from '../../Scope';
import { StructSymbol } from '../../symbols/StructSymbol';

export class StructLiteralExpressionChecker extends ExpressionChecker {
  constructor() {
    super();
  }

  override check(
    node: StructLiteralExpressionNode,
    scope: Scope,
    context: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    // Struct literals require a known target type to validate against
    if (wantedType === null)
      throw new KinaSemanticError(
        'Struct literal requires a known type context. Annotate the variable with a struct type.',
      );

    if (!isUserDefinedTypeKind(wantedType))
      throw new KinaSemanticError(
        `Struct literal cannot be assigned to primitive type '${wantedType}'.`,
      );

    const typeName = getUserDefinedTypeName(wantedType)!;
    const typeSymbol = scope.lookup(typeName);

    if (typeSymbol === null)
      throw new KinaSemanticError(`Type '${typeName}' is not defined.`);

    if (typeSymbol.kind !== SymbolKind.Struct)
      throw new KinaSemanticError(
        `'${typeName}' is a ${typeSymbol.kind.toLowerCase()}, not a struct type.`,
      );

    const structSymbol = typeSymbol as StructSymbol;
    const expectedFields = structSymbol.fields;
    const actualFields = node.fields;

    // Check for duplicate fields in the literal
    const seenFieldNames = new Set<string>();
    for (const field of actualFields) {
      if (seenFieldNames.has(field.name))
        throw new KinaSemanticError(
          `Duplicate field '${field.name}' in struct literal for '${typeName}'.`,
        );

      seenFieldNames.add(field.name);
    }

    // Check that all required fields are present
    for (const expectedField of expectedFields) {
      if (!seenFieldNames.has(expectedField.name))
        throw new KinaSemanticError(
          `Missing field '${expectedField.name}' in struct literal for '${typeName}'.`,
        );
    }

    // Check for unknown fields
    const expectedFieldNames = new Set(expectedFields.map((f) => f.name));
    for (const actualField of actualFields) {
      if (!expectedFieldNames.has(actualField.name))
        throw new KinaSemanticError(
          `Unknown field '${actualField.name}' in struct literal for '${typeName}'.`,
        );
    }

    // Type-check each field value
    for (const actualField of actualFields) {
      const expectedField = expectedFields.find(
        (f) => f.name === actualField.name,
      )!;
      const expectedFieldType = resolveASTType(expectedField.type);
      const actualFieldType = KinaSemanticAnalyzer.checkExpression(
        actualField.value,
        scope,
        context,
        expectedFieldType,
      );

      if (actualFieldType !== expectedFieldType)
        throw new KinaSemanticError(
          `Type mismatch for field '${actualField.name}' in struct literal for '${typeName}': expected '${expectedFieldType}', but got '${actualFieldType}'.`,
        );

      validateSignatureAssignment(
        expectedField.type,
        actualField.value,
        scope,
        context,
      );
    }

    return wantedType;
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}
}
