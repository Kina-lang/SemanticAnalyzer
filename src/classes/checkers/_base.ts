import type { BaseNode } from "@kina-lang/ast";
import type { Scope } from "../Scope";
import type { BaseSymbol } from "../symbols/_base";

export abstract class BaseChecker {
  abstract check(node: BaseNode, scope: Scope): void;
}
