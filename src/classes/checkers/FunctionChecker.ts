import { type FunctionNode } from '@kina-lang/ast';

import { BaseChecker } from './_base';
import { Checkers } from './_index';
import type { AnalysisContext } from '../AnalysisContext';
import { Scope } from '../Scope';
import { FunctionSymbol } from '../symbols/FunctionSymbol';

export class FunctionChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: FunctionNode, scope: Scope, ctx: AnalysisContext): void {
    if (scope.existsInCurrentScope(node.name))
      throw new Error(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const functionScope = new Scope(scope);
    const parameterSymbols = node.parameters.map((param) =>
      Checkers.FunctionParameter.checkParameter(param, functionScope),
    );

    parameterSymbols.forEach((param) =>
      functionScope.define(param.name, param),
    );

    const functionSymbol = new FunctionSymbol(
      node,
      node.name,
      parameterSymbols,
      node.returnType,
      functionScope,
    );

    scope.define(node.name, functionSymbol);

    const previousExpectedReturnType = ctx.getExpectedReturnType();
    ctx.setExpectedReturnType(node.returnType);

    // TODO: Ensure that the block ALWAYS returns on all code paths
    //       using reachability analysis and control flow graph (CFG) analysis.
    Checkers.BasicBlock.check(node.body, functionScope, ctx);

    ctx.setExpectedReturnType(previousExpectedReturnType);
  }
}
