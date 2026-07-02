import type { BaseNode, FileNode, KinaAST } from "@kina-lang/ast";
import type { BaseSymbol } from "./symbols/_base";
import { Scope } from "./Scope";
import { Checkers } from "./checkers/_index";

export class KinaSemanticAnalyzer {
  public analyze(ast: FileNode): BaseSymbol[] {
    const rootScope = new Scope(null);

    Checkers.File.check(ast, rootScope);

    return [];
  }
}
