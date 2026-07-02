import type { KinaTypeTokenKind } from '../types/type';

export class AnalysisContext {
  private _expectedReturnType: KinaTypeTokenKind | null = null;

  constructor() {}

  public setExpectedReturnType(type: KinaTypeTokenKind | null) {
    this._expectedReturnType = type;
  }

  public getExpectedReturnType(): KinaTypeTokenKind | null {
    return this._expectedReturnType;
  }
}
