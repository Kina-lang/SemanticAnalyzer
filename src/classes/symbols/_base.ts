import { randomBytes } from 'crypto';
import { inspect } from 'util';
import type { BaseNode } from '@kina-lang/ast';

import type { SymbolKind } from '../../types/symbol';

export abstract class BaseSymbol<DeclarationNode extends BaseNode = BaseNode> {
  protected readonly _kind: SymbolKind;
  protected readonly _name: string;
  protected readonly _node: DeclarationNode;
  protected readonly _mangledName: string;

  constructor(kind: SymbolKind, node: DeclarationNode, name: string) {
    this._kind = kind;
    this._node = node;
    this._name = name;
    this._mangledName = 'Z' + randomBytes(8).toString('hex');
  }

  public get kind(): SymbolKind {
    return this._kind;
  }

  public get name(): string {
    return this._name;
  }

  public get node(): DeclarationNode {
    return this._node;
  }

  public get mangledName(): string {
    return this._mangledName;
  }

  public export(): Record<string, unknown> {
    return {
      kind: this._kind,
      name: this._name,
      node: inspect(this._node, { depth: null, colors: true }),
      mangledName: this.mangledName,
    };
  }
}
