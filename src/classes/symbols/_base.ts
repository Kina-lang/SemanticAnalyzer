import type { BaseNode } from "@kina-lang/ast";
import type { SymbolKind } from "../../types/symbol";

export abstract class BaseSymbol<DeclarationNode extends BaseNode = BaseNode> {
  protected readonly _kind: SymbolKind;
  protected readonly _name: string;
  protected readonly _node: DeclarationNode;

  constructor(kind: SymbolKind, node: DeclarationNode, name: string) {
    this._kind = kind;
    this._node = node;
    this._name = name;
  }
}
