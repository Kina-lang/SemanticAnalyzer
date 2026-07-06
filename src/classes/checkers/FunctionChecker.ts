import { type FunctionNode } from '@kina-lang/ast';
import { KinaAssertionError } from '@kina-lang/utils';

import { BaseChecker } from './_base';
import { Checkers } from './_index';
import type { IAnalysisMeta } from '../../types/meta';
import type { AnalysisContext } from '../AnalysisContext';
import { Scope } from '../Scope';
import { FunctionSymbol } from '../symbols/FunctionSymbol';

export class FunctionChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: FunctionNode, scope: Scope, ctx: AnalysisContext): void {
    const functionSymbol = scope.lookup(node.name);
    if (!functionSymbol || !(functionSymbol instanceof FunctionSymbol))
      throw new KinaAssertionError(
        `Function '${node.name}' is not defined in the current scope.`,
      );

    const functionScope = functionSymbol.scope;

    const previousExpectedReturnType = ctx.getExpectedReturnType();
    ctx.setExpectedReturnType(node.returnType);

    // TODO: Ensure that the block ALWAYS returns on all code paths
    //       using reachability analysis and control flow graph (CFG) analysis.
    Checkers.BasicBlock.check(node.body, functionScope, ctx);

    ctx.setExpectedReturnType(previousExpectedReturnType);
  }

  override firstPass(
    node: FunctionNode,
    scope: Scope,
    context: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): void {
    if (scope.existsInCurrentScope(node.name))
      throw new Error(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const functionScope = new Scope(scope);
    const parameterSymbols = node.parameters.map((param, index) =>
      Checkers.FunctionParameter.checkParameter(param, functionScope, index),
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
      meta?.isExported ?? false,
    );

    scope.define(node.name, functionSymbol);
  }
}
