import type { FunctionNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import type { FunctionParameterSymbol } from './FunctionParameterSymbol';
import { SymbolKind } from '../../types/symbol';
import type { KinaTypeTokenKind } from '../../types/type';
import type { Scope } from '../Scope';

export class FunctionSymbol extends BaseSymbol<FunctionNode> {
  protected readonly _parameterSymbols: FunctionParameterSymbol[];
  protected readonly _returnType: KinaTypeTokenKind;
  protected readonly _scope: Scope;
  protected readonly _isExported: boolean;

  constructor(
    node: FunctionNode,
    name: string,
    parameterSymbols: FunctionParameterSymbol[],
    returnType: KinaTypeTokenKind,
    scope: Scope,
    isExported: boolean,
  ) {
    super(SymbolKind.Function, node, name);

    this._parameterSymbols = parameterSymbols;
    this._returnType = returnType;
    this._scope = scope;
    this._isExported = isExported;
  }

  public get parameterSymbols(): FunctionParameterSymbol[] {
    return this._parameterSymbols;
  }

  public get parameterTypes(): KinaTypeTokenKind[] {
    return this._parameterSymbols.map((param) => param.type);
  }

  public get returnType(): KinaTypeTokenKind {
    return this._returnType;
  }

  public get scope(): Scope {
    return this._scope;
  }

  public get isExported(): boolean {
    return this._isExported;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      parameterSymbols: this._parameterSymbols.map((param) => param.export()),
      returnType: this._returnType,
      scope: this._scope.export(),
      isExported: this._isExported,
    };
  }
}
