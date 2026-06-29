import type { KinaASTParameterDeclarationNode } from "@kina-lang/ast";
import type { IKinaLexerTokenKindType } from "../../../lexer/src";
import { EKinaSASymbolKind } from "../types/symbol";
import { KinaSASymbol } from "./_symbol";
import type { KinaSAFunctionSymbol } from "./functionSymbol";

export class KinaSAVariableSymbol extends KinaSASymbol {
  protected readonly _name: string;
  protected readonly _type: IKinaLexerTokenKindType;
  protected readonly _parent: KinaSAFunctionSymbol;

  constructor(
    name: string,
    type: IKinaLexerTokenKindType,
    parent: KinaSAFunctionSymbol,
  ) {
    super(EKinaSASymbolKind.Variable);

    this._name = name;
    this._type = type;
    this._parent = parent;
  }

  public get type() {
    return this._type;
  }

  public get parent() {
    return this._parent;
  }

  public get name() {
    return this._name;
  }

  public getMangledName(): string {
    return `k_fn_param_Z${this.parent.getMangledName(true)}${this.name.length}${this.name}`;
  }

  public override toJson() {
    const r = super.toJson();

    return {
      ...r,
      name: this.name,
      mangledName: this.getMangledName(),
      type: this._type,
      parent: this._parent,
    };
  }
}
