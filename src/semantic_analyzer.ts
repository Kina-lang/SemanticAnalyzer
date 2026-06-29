import type { KinaASTNode } from "@kina-lang/ast/src/nodes/_node";
import { KinaSASymbolTable } from "./symbol_table";
import {
  EKinaASTNodeKind,
  KinaASTCallExpressionNode,
  KinaASTFunctionDeclarationNode,
  KinaASTLiteralExpressionNode,
  KinaASTReturnStatementNode,
  type IKinaASTExpressionNode,
} from "@kina-lang/ast";
import { KinaSAFunctionSymbol } from "./symbol/functionSymbol";
import {
  EKinaLexerTokenKind,
  type IKinaLexerTokenKindType,
} from "../../lexer/src";

export class KinaSemanticAnalyzer {
  private readonly ast: KinaASTNode[];
  private readonly fileName: string;

  private readonly globalSymbolTable: KinaSASymbolTable =
    new KinaSASymbolTable();
  private readonly localSymbolTable: KinaSASymbolTable =
    new KinaSASymbolTable();
  private currentScope: KinaSAFunctionSymbol | null = null;

  constructor(ast: KinaASTNode[], fileName?: string) {
    this.ast = ast;
    this.fileName = fileName ?? "anonymous";
  }

  public async analyze() {
    await this.registerTopLevelSymbols(this.ast);

    this.validateTopLevel();

    for (const node of this.ast) {
      await this.analyzeNode(node);
    }

    return this.globalSymbolTable.toJson();
  }

  private async registerTopLevelSymbols(nodes: KinaASTNode[]) {
    for (const node of nodes) {
      if (node.kind == EKinaASTNodeKind.FunctionDeclaration) {
        await this.registerFunction(
          node as KinaASTFunctionDeclarationNode,
          null,
        );
      }
    }
  }

  private async registerFunction(
    node: KinaASTFunctionDeclarationNode,
    parentSymbol: KinaSAFunctionSymbol | null,
  ) {
    const symbol = new KinaSAFunctionSymbol(
      node.name,
      node.returnType,
      node.parameters,
    );
    symbol.setParent(parentSymbol);

    if (!parentSymbol) {
      if (this.globalSymbolTable.lookup(node.name))
        throw new Error(
          `Symbol ${node.name} is already defined in top level scope!`,
        );

      this.globalSymbolTable.define(node.name, symbol);
    } else {
      /*if (parentSymbol.lookup(node.name))
        throw new Error(
          `Symbol ${node.name} is already defined in top level scope!`,
        );*/

      parentSymbol.define(node.name, symbol);
    }

    for (const stmt of node.body.statements) {
      if (stmt.kind == EKinaASTNodeKind.FunctionDeclaration) {
        this.registerFunction(stmt as KinaASTFunctionDeclarationNode, symbol);
      }
    }
  }

  private async analyzeNode(node: KinaASTNode) {
    switch (node.kind) {
      case EKinaASTNodeKind.FunctionDeclaration:
        const fn = node as KinaASTFunctionDeclarationNode;

        const symbol =
          this.currentScope === null
            ? this.globalSymbolTable.lookup(fn.name)
            : this.currentScope.lookup(fn.name);
        if (!symbol)
          throw new Error(
            `Critical compiler error! Symbol ${fn.name} missing in pass 2`,
          );

        const previousScope = this.currentScope;
        this.currentScope = symbol as KinaSAFunctionSymbol;

        this.analyzeBlock(fn.body.statements);

        this.currentScope = previousScope;

        break;
      case EKinaASTNodeKind.ReturnStatement:
        this.analyzeReturnStatement(node as KinaASTReturnStatementNode);
        break;
      case EKinaASTNodeKind.ExpressionCall:
        this.analyzeExpressionCall(node as KinaASTCallExpressionNode);
        break;
      case EKinaASTNodeKind.ExpressionStatement:
        // TODO: Implement
        break;
      case EKinaASTNodeKind.ExternDeclaration:
        // TODO: Implement
        break;
      case EKinaASTNodeKind.IncludeDirective:
        // TODO: Implement
        break;
      default:
        throw new Error(`Invalid node type "${node.kind}"!`);
    }
  }

  private analyzeBlock(nodes: KinaASTNode[]) {
    this.localSymbolTable.pushScope();

    for (const node of nodes) {
      this.analyzeNode(node);
    }

    this.localSymbolTable.popScope();
  }

  private analyzeExpressionCall(node: KinaASTCallExpressionNode) {}

  private analyzeReturnStatement(node: KinaASTReturnStatementNode) {
    if (!this.currentScope)
      throw new Error("Return statement outside of function body");

    const expectedType = this.currentScope.returnType;
    let actualType = EKinaLexerTokenKind.TypeString; // TODO: Change to void

    if (node.value !== null)
      actualType = this.analyzeExpression(node.value, expectedType);

    if (expectedType != actualType)
      throw new Error(`Expected type ${expectedType}, but got ${actualType}!`);
  }

  private analyzeExpression(
    node: IKinaASTExpressionNode,
    expectedType: IKinaLexerTokenKindType,
  ): IKinaLexerTokenKindType {
    let evaluatedType: IKinaLexerTokenKindType;

    switch (node.kind) {
      case EKinaASTNodeKind.LiteralStatement:
        evaluatedType = this.analyzeLiteralExpression(
          node as KinaASTLiteralExpressionNode,
          expectedType,
        );
        break;
      default:
        throw new Error(`Invalid expression type ${node.kind}`);
    }

    (node as any).setResolvedType(evaluatedType);
    return evaluatedType;
  }

  private analyzeLiteralExpression(
    node: KinaASTLiteralExpressionNode,
    expectedType: IKinaLexerTokenKindType,
  ): IKinaLexerTokenKindType {
    switch (node.literalType) {
      case EKinaLexerTokenKind.LiteralInt:
        // TODO: Add resolution to correct type depending on the expected one and
        //       on size requirements
        return EKinaLexerTokenKind.TypeInt32;
      case EKinaLexerTokenKind.LiteralFloat:
        // TODO: Implement
        throw new Error("Floats are not implemented yet!");
      case EKinaLexerTokenKind.LiteralBool:
        return EKinaLexerTokenKind.TypeBool;
      case EKinaLexerTokenKind.LiteralString:
        return EKinaLexerTokenKind.TypeString;
      default:
        throw new Error(`Unknown literal type ${node.literalType}`);
    }
  }

  private validateTopLevel() {
    // Main must be defined
    const main = this.globalSymbolTable.lookup(
      "main",
    ) as KinaASTFunctionDeclarationNode | null;
    if (!main) throw new Error("Function 'main' is not defined!");

    // Main must be of return type int32
    if (main.returnType != EKinaLexerTokenKind.TypeInt32)
      throw new Error(
        `Function 'main' has invalid return type '${main.returnType}', expected '${EKinaLexerTokenKind.TypeInt32}'`,
      );

    // Main must not have any parameters
    if (main.parameters.length > 0)
      throw new Error("Function 'main' must not have any parameters!");
  }
}
