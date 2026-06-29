import safeJsonValue from "safe-json-value";
import type { KinaSASymbol } from "./symbol/_symbol";

export class KinaSASymbolTable {
  private scopes: Map<string, KinaSASymbol>[] = [new Map()];

  constructor() {}

  public pushScope() {
    this.scopes.push(new Map());
  }

  public popScope() {
    this.scopes.pop();
  }

  public define(name: string, symbol: KinaSASymbol) {
    this.scopes[this.scopes.length - 1]!.set(name, symbol);
  }

  public lookup(name: string): KinaSASymbol | null {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i]!.has(name)) return this.scopes[i]!.get(name)!;
    }

    return null;
  }

  public toJson() {
    const { value } = safeJsonValue(
      this.scopes.map((s) => KinaSASymbolTable.symbolMapToJson(s)),
    );

    return value;
  }

  public static symbolMapToJson(map: Map<string, KinaSASymbol>) {
    const symbols: KinaSASymbol[] = [];

    map.forEach((s) => {
      symbols.push(s);
    });

    return symbols.map((s) => s.toJson());
  }
}
