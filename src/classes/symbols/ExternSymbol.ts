import type { ExternNode } from "@kina-lang/ast";
import { BaseSymbol } from "./_base";
import { SymbolKind } from "../../types/symbol";
import type { KinaTypeTokenKind } from "../../types/type";

export class ExternSymbol extends BaseSymbol<ExternNode> {
  protected readonly _parameterTypes: KinaTypeTokenKind[];
  protected readonly _returnType: KinaTypeTokenKind;

  constructor(
    node: ExternNode,
    name: string,
    parameterTypes: KinaTypeTokenKind[],
    returnType: KinaTypeTokenKind,
  ) {
    super(SymbolKind.Extern, node, name);

    this._parameterTypes = parameterTypes;
    this._returnType = returnType;
  }
}
