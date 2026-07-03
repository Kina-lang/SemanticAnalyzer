import { KinaSemanticError } from '@kina-lang/utils';

import type { BaseSymbol } from './symbols/_base';

export class Scope {
  private readonly _parent: Scope | null;
  private readonly _symbols: Map<string, BaseSymbol> = new Map();
  private readonly _children: Scope[] = [];

  constructor(parent: Scope | null) {
    this._parent = parent;

    if (this._parent) this._parent._children.push(this);
  }

  /**
   * Defines symbol in the current scope.
   * @param name
   * @param symbol
   */
  public define(name: string, symbol: BaseSymbol) {
    if (this._symbols.has(name))
      throw new KinaSemanticError(
        `Symbol '${name}' is already defined in the current scope.`,
      );

    this._symbols.set(name, symbol);
  }

  /**
   * Looks up symbol in the current scope (preferentially) and its parent scopes.
   * @param name
   * @returns
   */
  public lookup(name: string): BaseSymbol | null {
    if (this._symbols.has(name)) return this._symbols.get(name)!;
    if (this._parent) return this._parent.lookup(name);

    return null;
  }

  /**
   * Checks if a symbol exists in the current scope (does not check parent scopes)
   * @param name
   * @returns
   */
  public existsInCurrentScope(name: string): boolean {
    return this._symbols.has(name);
  }

  /**
   * Exports the scope as a JSON object.
   * @returns
   */
  public export(): Record<string, unknown> {
    return {
      //parent: this._parent,
      symbols: Object.fromEntries(
        this._symbols
          .entries()
          .map(([name, symbol]) => [name, symbol.export()]),
      ),
      children: this._children.map((child) => child.export()),
    };
  }
}
