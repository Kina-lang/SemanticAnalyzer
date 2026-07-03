import type { BasicBlockNode } from '@kina-lang/ast';

import { BaseSymbol } from './_base';
import { SymbolKind } from '../../types/symbol';
import type { Scope } from '../Scope';

export class BasicBlockSymbol extends BaseSymbol {
  private readonly _scope: Scope;

  constructor(node: BasicBlockNode, scope: Scope) {
    super(SymbolKind.BasicBlock, node, node.name);

    this._scope = scope;
  }

  public get scope(): Scope {
    return this._scope;
  }

  public override export(): Record<string, unknown> {
    return {
      ...super.export(),
      scope: this._scope.export(),
    };
  }
}
