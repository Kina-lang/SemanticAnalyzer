import type { BaseNode, ExternNode, FileNode } from "@kina-lang/ast";
import type { Scope } from "../Scope";
import type { BaseSymbol } from "../symbols/_base";
import { BaseChecker } from "./_base";
import { NodeKind } from "@kina-lang/ast/src/types/nodes";
import { KinaAssertionError } from "@kina-lang/utils";
import { Checkers } from "./_index";

export class FileChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: FileNode, scope: Scope) {
    for (const subNode of node.nodes) {
      this.checkChildrenNode(subNode, scope);
    }
  }

  private checkChildrenNode(node: BaseNode, scope: Scope) {
    switch (node.kind) {
      case NodeKind.Extern:
        const externNode = node as ExternNode;
        Checkers.Extern.check(externNode, scope);
        break;
      case NodeKind.IncludeDirective:
        // no op: Ignored
        break;
      default:
        throw new KinaAssertionError("Unknown node kind: " + node.kind);
    }
  }
}
