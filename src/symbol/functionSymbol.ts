import type { KinaASTParameterDeclarationNode } from "@kina-lang/ast";
import type { IKinaLexerTokenKindType } from "../../../lexer/src";
import { EKinaSASymbolKind } from "../types/symbol";
import { KinaSASymbol } from "./_symbol";
import { KinaSASymbolTable } from "../symbol_table";

export class KinaSAFunctionSymbol extends KinaSASymbol {
  protected readonly _name: string;
  protected readonly _returnType: IKinaLexerTokenKindType;
  protected readonly _parameters: KinaASTParameterDeclarationNode[];

  protected readonly _children: Map<string, KinaSASymbol> = new Map();
  protected _parent: KinaSAFunctionSymbol | null = null;

  constructor(
    name: string,
    returnType: IKinaLexerTokenKindType,
    parameters: KinaASTParameterDeclarationNode[],
  ) {
    super(EKinaSASymbolKind.Function);

    this._name = name;
    this._returnType = returnType;
    this._parameters = parameters;
  }

  public get returnType() {
    return this._returnType;
  }

  public get parameters() {
    return this._parameters;
  }

  public setParent(parentSymbol: KinaSAFunctionSymbol | null) {
    this._parent = parentSymbol;
  }

  public define(name: string, symbol: KinaSASymbol) {
    this._children.set(name, symbol);
  }

  public lookup(name: string): KinaSASymbol | null {
    return this._children.get(name) ?? null;
  }

  public get name() {
    return this._name;
  }

  public get mangledName(): string {
    return `${!this._parent ? `k_fn_Z` : this._parent.mangledName}${this.name.length}${this.name}`;
  }

  public override toJson() {
    const r = super.toJson();

    return {
      ...r,
      name: this.name,
      mangledName: this.mangledName,
      parameters: this._parameters,
      returnType: this._returnType,
      symbols: KinaSASymbolTable.symbolMapToJson(this._children),
    };
  }
}
