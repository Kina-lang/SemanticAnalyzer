import type { IdentifierExpressionNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';

export class ImportedVariableSymbol extends BaseSymbol<IdentifierExpressionNode> {
  private readonly _type: KinaTypeTokenKind;
  private readonly _isMutable: boolean;

  constructor(
    node: IdentifierExpressionNode,
    mangledName: string,
    type: KinaTypeTokenKind,
    isMutable: boolean,
  ) {
    super(SymbolKind.ImportedVariable, node, mangledName);

    this._type = type;
    this._isMutable = isMutable;
  }

  public get type(): KinaTypeTokenKind {
    return this._type;
  }

  public get isMutable(): boolean {
    return this._isMutable;
  }

  public override get mangledName(): string {
    return this._name;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      type: this._type,
      isMutable: this._isMutable,
    };
  }
}
