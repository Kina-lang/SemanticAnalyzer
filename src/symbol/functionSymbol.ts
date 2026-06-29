import type {
  KinaASTParameterDeclarationNode,
  KinaASTVariableAccessNode,
} from "@kina-lang/ast";
import type { IKinaLexerTokenKindType } from "../../../lexer/src";
import { EKinaSASymbolKind } from "../types/symbol";
import { KinaSASymbol } from "./_symbol";
import { KinaSASymbolTable } from "../symbol_table";
import { KinaSAVariableSymbol } from "./variableSymbol";

export class KinaSAFunctionSymbol extends KinaSASymbol {
  protected readonly _name: string;
  protected readonly _returnType: IKinaLexerTokenKindType;
  protected readonly _parameters: KinaSAVariableSymbol[];

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
    this._parameters = parameters.map(
      (p) => new KinaSAVariableSymbol(p.name, p.type, this),
    );

    for (const param of this._parameters) {
      this.define(param.name, param);
    }
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

  public getMangledName(skipPrefix: boolean = false): string {
    return `${!this._parent ? (skipPrefix ? "" : `k_fn_Z`) : this._parent.getMangledName()}${this.name.length}${this.name}`;
  }

  public override toJson() {
    const r = super.toJson();

    return {
      ...r,
      name: this.name,
      mangledName: this.getMangledName(),
      parameters: this._parameters.map((p) => ({
        name: p.name,
        type: p.type,
        kind: p.kind,
      })),
      returnType: this._returnType,
      symbols: KinaSASymbolTable.symbolMapToJson(this._children),
    };
  }
}
