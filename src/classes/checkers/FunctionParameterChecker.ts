import {
  NodeKind,
  type BaseNode,
  type FunctionParameterNode,
} from '@kina-lang/ast';
import { KinaAssertionError, KinaSemanticError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import type { AnalysisContext } from '../AnalysisContext';
import type { Scope } from '../Scope';
import { FunctionParameterSymbol } from '../symbols/FunctionParameterSymbol';

export class FunctionParameterChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: BaseNode, scope: Scope, ctx: AnalysisContext): void {
    throw new KinaAssertionError(
      'Function parameter nodes should not be checked directly. They are checked as part of the function node.',
    );
  }

  override firstPass(
    node: BaseNode,
    scope: Scope,
    context: AnalysisContext,
  ): void {}

  checkParameter(
    node: FunctionParameterNode,
    scope: Scope,
    index: number,
  ): FunctionParameterSymbol {
    if (scope.existsInCurrentScope(node.name))
      throw new KinaSemanticError(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );
    if (node.kind !== NodeKind.FunctionParameter)
      throw new KinaAssertionError(
        `Expected a FunctionParameterNode, but got ${node.kind}.`,
      );

    return new FunctionParameterSymbol(node, node.name, node.type, index);
  }
}
