import type { StructFieldNode, StructNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';

export class StructSymbol extends BaseSymbol<StructNode> {
  protected readonly _fields: StructFieldNode[];
  protected readonly _isExported: boolean;

  constructor(
    node: StructNode,
    name: string,
    structFields: StructFieldNode[],
    isExported: boolean,
  ) {
    super(SymbolKind.Struct, node, name);

    this._fields = structFields;
    this._isExported = isExported;
  }

  public get fields(): StructFieldNode[] {
    return this._fields;
  }

  public get isExported(): boolean {
    return this._isExported;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      fields: this._fields.map((field) => field.export()),
      isExported: this._isExported,
    };
  }
}
