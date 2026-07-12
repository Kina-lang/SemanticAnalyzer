import type { VariableDeclarationStatementNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';

export class VariableSymbol extends BaseSymbol<VariableDeclarationStatementNode> {
  private readonly _type: KinaTypeTokenKind;
  private readonly _isMutable: boolean;
  private readonly _isExported: boolean;

  constructor(
    node: VariableDeclarationStatementNode,
    name: string,
    type: KinaTypeTokenKind,
    isMutable: boolean,
    isExported: boolean,
  ) {
    super(SymbolKind.Variable, node, name);

    this._type = type;
    this._isMutable = isMutable;
    this._isExported = isExported;
  }

  public get type(): KinaTypeTokenKind {
    return this._type;
  }

  public get isMutable(): boolean {
    return this._isMutable;
  }

  public get isExported(): boolean {
    return this._isExported;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      type: this._type,
      isMutable: this._isMutable,
      isExported: this._isExported,
    };
  }
}
