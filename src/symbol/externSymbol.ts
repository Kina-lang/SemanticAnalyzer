import type { KinaASTParameterDeclarationNode } from "@kina-lang/ast";
import type { IKinaLexerTokenKindType } from "../../../lexer/src";
import { EKinaSASymbolKind } from "../types/symbol";
import { KinaSASymbol } from "./_symbol";

export class KinaSAExternSymbol extends KinaSASymbol {
  protected readonly _name: string;
  protected readonly _returnType: IKinaLexerTokenKindType;
  protected readonly _parameterTypes: IKinaLexerTokenKindType[];

  constructor(
    name: string,
    returnType: IKinaLexerTokenKindType,
    parameterTypes: IKinaLexerTokenKindType[],
  ) {
    super(EKinaSASymbolKind.Extern);

    this._name = name;
    this._returnType = returnType;
    this._parameterTypes = parameterTypes;
  }

  public get returnType() {
    return this._returnType;
  }

  public get parameterTypes() {
    return this._parameterTypes;
  }

  public get name() {
    return this._name;
  }

  public get mangledName(): string {
    // TODO: Implement in future: must also do C name translation inside compiler
    return this.name;
  }

  public override toJson() {
    const r = super.toJson();

    return {
      ...r,
      name: this.name,
      mangledName: this.mangledName,
      parameterTypes: this._parameterTypes,
      returnType: this._returnType,
    };
  }
}
