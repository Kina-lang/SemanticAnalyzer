import type { EKinaSASymbolKind } from "../types/symbol";

export class KinaSASymbol {
  protected readonly _kind: EKinaSASymbolKind;

  protected constructor(kind: EKinaSASymbolKind) {
    this._kind = kind;
  }

  public get kind() {
    return this._kind;
  }
}
