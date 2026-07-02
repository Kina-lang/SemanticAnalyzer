import type {
  BaseNode,
  BasicBlockNode,
  CallExpressionNode,
  ExpressionStatementNode,
  ExternNode,
  FileNode,
  FunctionNode,
  LiteralExpressionNode,
  ReturnStatementNode,
  VariableDeclarationStatementNode,
} from '@kina-lang/ast';
import { NodeKind } from '@kina-lang/ast';
import { KinaAssertionError } from '@kina-lang/utils';

import { AnalysisContext } from './AnalysisContext';
import { Checkers } from './checkers/_index';
import { Scope } from './Scope';
import type { KinaTypeTokenKind } from '../types/type';

export class KinaSemanticAnalyzer {
  public analyze(ast: FileNode): Scope {
    const rootScope = new Scope(null);
    const ctx = new AnalysisContext();

    KinaSemanticAnalyzer.checkNode(ast, rootScope, ctx);

    return rootScope;
  }

  public static checkNodes(
    nodes: BaseNode[],
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    for (const node of nodes) {
      this.checkNode(node, scope, ctx);
    }
  }

  public static checkNode(
    node: BaseNode,
    scope: Scope,
    ctx: AnalysisContext,
  ): void {
    switch (node.kind) {
      case NodeKind.File:
        const fileNode = node as FileNode;
        Checkers.File.check(fileNode, scope, ctx);
        break;
      case NodeKind.Extern:
        const externNode = node as ExternNode;
        Checkers.Extern.check(externNode, scope, ctx);
        break;
      case NodeKind.Function:
        const functionNode = node as FunctionNode;
        Checkers.Function.check(functionNode, scope, ctx);
        break;
      case NodeKind.VariableDeclarationStatement:
        const variableDeclarationNode =
          node as VariableDeclarationStatementNode;
        Checkers.VariableDeclaration.check(variableDeclarationNode, scope, ctx);
        break;
      case NodeKind.BasicBlock:
        const basicBlockNode = node as BasicBlockNode;
        Checkers.BasicBlock.check(basicBlockNode, scope, ctx);
        break;
      case NodeKind.ReturnStatement:
        const returnStatementNode = node as ReturnStatementNode;
        Checkers.ReturnStatement.check(returnStatementNode, scope, ctx);
        break;
      case NodeKind.ExpressionStatement:
        const expressionStatementNode = node as ExpressionStatementNode;
        Checkers.ExpressionStatement.check(expressionStatementNode, scope, ctx);
        break;
      case NodeKind.IncludeDirective:
        // no op: Ignored
        // TODO: Add symbol registration so that we can correctly check extern signatures
        break;
      default:
        throw new KinaAssertionError('Unknown node kind: ' + node.kind);
    }
  }

  public static checkExpression(
    node: BaseNode,
    scope: Scope,
    ctx: AnalysisContext,
    wantedType: KinaTypeTokenKind | null = null,
  ): KinaTypeTokenKind {
    switch (node.kind) {
      case NodeKind.LiteralExpression:
        const literalExpressionNode = node as LiteralExpressionNode;
        return Checkers.Expression.Literal.check(
          literalExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      case NodeKind.CallExpression:
        const callExpressionNode = node as CallExpressionNode;
        return Checkers.Expression.Call.check(
          callExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      default:
        throw new KinaAssertionError(
          'Unknown expression node kind: ' + node.kind,
        );
    }
  }
}
