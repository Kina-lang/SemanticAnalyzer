import type {
  BaseNode,
  BasicBlockNode,
  BinaryExpressionNode,
  CallExpressionNode,
  ExportNode,
  ExpressionStatementNode,
  ExternNode,
  FileNode,
  FunctionNode,
  GroupExpressionNode,
  IdentifierExpressionNode,
  IfStatementNode,
  LiteralExpressionNode,
  MemberAccessExpressionNode,
  ReturnStatementNode,
  StructNode,
  UnaryExpressionNode,
  VariableDeclarationStatementNode,
} from '@kina-lang/ast';
import { NodeKind } from '@kina-lang/ast';
import type { ImportNode } from '@kina-lang/ast/src/classes/nodes/Import';
import type { KinaCompiler } from '@kina-lang/compiler';
import { KinaAssertionError } from '@kina-lang/utils';

import { AnalysisContext } from './AnalysisContext';
import { Checkers } from './checkers/_index';
import { Rules } from './rules/_index';
import { Scope } from './Scope';
import type { IAnalysisMeta } from '../types/meta';
import type { KinaTypeTokenKind } from '../types/type';

export class KinaSemanticAnalyzer {
  public async analyze(
    ast: FileNode,
    compiler: KinaCompiler,
    filePath: string,
    isIncluded: boolean = false,
  ): Promise<Scope> {
    const rootScope = new Scope(null);
    const ctx = new AnalysisContext(compiler, filePath);

    await this.firstPass(ast, rootScope, ctx);
    await this.secondPass(ast, rootScope, ctx);

    await this.validateRules(rootScope, ctx, isIncluded);

    return rootScope;
  }

  // First pass, register only
  public async firstPass(
    ast: FileNode,
    rootScope: Scope,
    ctx: AnalysisContext,
  ): Promise<void> {
    await KinaSemanticAnalyzer.firstPassNode(ast, rootScope, ctx);
  }

  // Second pass, validate
  public secondPass(
    ast: FileNode,
    rootScope: Scope,
    ctx: AnalysisContext,
  ): void {
    KinaSemanticAnalyzer.checkNode(ast, rootScope, ctx);
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
      case NodeKind.IfStatement:
        const ifStatementNode = node as IfStatementNode;
        Checkers.IfStatement.check(ifStatementNode, scope, ctx);
        break;
      case NodeKind.Import:
        const importNode = node as ImportNode;
        Checkers.Import.check(importNode, scope, ctx);
        break;
      case NodeKind.Export:
        const exportNode = node as ExportNode;
        Checkers.Export.check(exportNode, scope, ctx);
        break;
      case NodeKind.Struct:
        const structNode = node as StructNode;
        Checkers.Struct.check(structNode, scope, ctx);
        break;
      case NodeKind.IncludeDirective:
        // no op: Ignored
        // TODO: Add symbol registration so that we can correctly check extern signatures
        break;
      default:
        throw new KinaAssertionError('Unknown node kind: ' + node.kind);
    }
  }

  public static async firstPassNode(
    node: BaseNode,
    scope: Scope,
    ctx: AnalysisContext,
    meta?: Partial<IAnalysisMeta>,
  ): Promise<void> {
    switch (node.kind) {
      case NodeKind.File:
        const fileNode = node as FileNode;
        await Checkers.File.firstPass(fileNode, scope, ctx, meta);
        break;
      case NodeKind.Extern:
        const externNode = node as ExternNode;
        await Checkers.Extern.firstPass(externNode, scope, ctx, meta);
        break;
      case NodeKind.Function:
        const functionNode = node as FunctionNode;
        await Checkers.Function.firstPass(functionNode, scope, ctx, meta);
        break;
      case NodeKind.Import:
        const importNode = node as ImportNode;
        await Checkers.Import.firstPass(importNode, scope, ctx, meta);
        break;
      case NodeKind.Export:
        const exportNode = node as ExportNode;
        await Checkers.Export.firstPass(exportNode, scope, ctx, meta);
        break;
      case NodeKind.Struct:
        const structNode = node as StructNode;
        await Checkers.Struct.firstPass(structNode, scope, ctx, meta);
        break;
      case NodeKind.VariableDeclarationStatement:
      case NodeKind.BasicBlock:
      case NodeKind.ReturnStatement:
      case NodeKind.ExpressionStatement:
      case NodeKind.IncludeDirective:
      case NodeKind.IfStatement:
        // no op: Ignored
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
      case NodeKind.IdentifierExpression:
        const identifierExpressionNode = node as IdentifierExpressionNode;
        return Checkers.Expression.Identifier.check(
          identifierExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      case NodeKind.GroupExpression:
        const groupExpressionNode = node as GroupExpressionNode;
        return Checkers.Expression.Group.check(
          groupExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      case NodeKind.BinaryExpression:
        const binaryExpressionNode = node as BinaryExpressionNode;
        return Checkers.Expression.Binary.check(
          binaryExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      case NodeKind.UnaryExpression:
        const unaryExpressionNode = node as UnaryExpressionNode;
        return Checkers.Expression.Unary.check(
          unaryExpressionNode,
          scope,
          ctx,
          wantedType,
        );
      case NodeKind.MemberAccessExpression:
        const memberAccessExpressionNode = node as MemberAccessExpressionNode;
        return Checkers.Expression.MemberAccess.check(
          memberAccessExpressionNode,
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

  public validateRules(
    scope: Scope,
    ctx: AnalysisContext,
    isIncluded: boolean,
  ): void {
    for (const rule of Rules) {
      rule.validate(scope, ctx, isIncluded);
    }
  }
}
