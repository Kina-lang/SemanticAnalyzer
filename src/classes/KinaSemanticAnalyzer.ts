import type {
  BaseNode,
  BasicBlockNode,
  ExternNode,
  FileNode,
  FunctionNode,
  VariableDeclarationStatementNode,
} from '@kina-lang/ast';
import { NodeKind } from '@kina-lang/ast';
import { KinaAssertionError } from '@kina-lang/utils';

import { Checkers } from './checkers/_index';
import { Scope } from './Scope';

export class KinaSemanticAnalyzer {
  public analyze(ast: FileNode): Scope {
    const rootScope = new Scope(null);

    KinaSemanticAnalyzer.checkNode(ast, rootScope);

    return rootScope;
  }

  public static checkNodes(nodes: BaseNode[], scope: Scope): void {
    for (const node of nodes) {
      this.checkNode(node, scope);
    }
  }

  public static checkNode(node: BaseNode, scope: Scope): void {
    switch (node.kind) {
      case NodeKind.File:
        const fileNode = node as FileNode;
        Checkers.File.check(fileNode, scope);
        break;
      case NodeKind.Extern:
        const externNode = node as ExternNode;
        Checkers.Extern.check(externNode, scope);
        break;
      case NodeKind.Function:
        const functionNode = node as FunctionNode;
        Checkers.Function.check(functionNode, scope);
        break;
      case NodeKind.VariableDeclarationStatement:
        const variableDeclarationNode =
          node as VariableDeclarationStatementNode;
        Checkers.VariableDeclaration.check(variableDeclarationNode, scope);
        break;
      case NodeKind.IncludeDirective:
        // no op: Ignored
        // TODO: Add symbol registration so that we can correctly check extern signatures
        break;
      case NodeKind.BasicBlock:
        const basicBlockNode = node as BasicBlockNode;
        Checkers.BasicBlock.check(basicBlockNode, scope);
        break;
      default:
        throw new KinaAssertionError('Unknown node kind: ' + node.kind);
    }
  }
}
