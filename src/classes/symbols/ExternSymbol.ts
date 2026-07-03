import type { ExternNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';

export class ExternSymbol extends BaseSymbol<ExternNode> {
  protected readonly _parameterTypes: KinaTypeTokenKind[];
  protected readonly _returnType: KinaTypeTokenKind;

  constructor(
    node: ExternNode,
    name: string,
    parameterTypes: KinaTypeTokenKind[],
    returnType: KinaTypeTokenKind,
  ) {
    super(SymbolKind.Extern, node, name);

    this._parameterTypes = parameterTypes;
    this._returnType = returnType;
  }

  public get parameterTypes(): KinaTypeTokenKind[] {
    return this._parameterTypes;
  }

  public get returnType(): KinaTypeTokenKind {
    return this._returnType;
  }

  public override get mangledName(): string {
    // Override: MUST be the same as the name declared in the source code, since this is an external symbol
    return this._name;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      parameterTypes: this._parameterTypes,
      returnType: this._returnType,
    };
  }
}
