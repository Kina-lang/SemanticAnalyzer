import type { FunctionParameterNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';

export class FunctionParameterSymbol extends BaseSymbol<FunctionParameterNode> {
  protected readonly _type: KinaTypeTokenKind;
  protected readonly _index: number;

  constructor(
    node: FunctionParameterNode,
    name: string,
    type: KinaTypeTokenKind,
    index: number,
  ) {
    super(SymbolKind.FunctionParameter, node, name);
    this._type = type;
    this._index = index;
  }

  public get type(): KinaTypeTokenKind {
    return this._type;
  }

  public get index(): number {
    return this._index;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      index: this._index,
      type: this._type,
    };
  }
}
