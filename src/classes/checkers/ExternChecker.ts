import type { BaseNode, ExternNode } from "@kina-lang/ast";
import type { Scope } from "../Scope";
import type { BaseSymbol } from "../symbols/_base";
import { BaseChecker } from "./_base";
import { KinaSemanticError } from "@kina-lang/utils";
import { ExternSymbol } from "../symbols/ExternSymbol";

export class ExternChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: ExternNode, scope: Scope) {
    if (scope.existsInCurrentScope(node.name))
      throw new KinaSemanticError(
        `Symbol '${node.name}' is already defined in the current scope.`,
      );

    const symbol = new ExternSymbol(
      node,
      node.name,
      node.parameterTypes,
      node.returnType,
    );
    scope.define(node.name, symbol);
  }
}
