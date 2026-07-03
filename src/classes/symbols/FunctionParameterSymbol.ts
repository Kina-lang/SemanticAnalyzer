import type { FunctionParameterNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';

export class FunctionParameterSymbol extends BaseSymbol<FunctionParameterNode> {
  protected readonly _type: KinaTypeTokenKind;

  constructor(
    node: FunctionParameterNode,
    name: string,
    type: KinaTypeTokenKind,
  ) {
    super(SymbolKind.FunctionParameter, node, name);
    this._type = type;
  }

  public get type(): KinaTypeTokenKind {
    return this._type;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      type: this._type,
    };
  }
}
