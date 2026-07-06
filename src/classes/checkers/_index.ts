import { BasicBlockChecker } from './BasicBlockChecker';
import { ExportChecker } from './ExportChecker';
import { BinaryExpressionChecker } from './expressions/BinaryExpressionChecker';
import { CallExpressionChecker } from './expressions/CallExpressionChecker';
import { GroupExpressionChecker } from './expressions/GroupExpressionChecker';
import { IdentifierExpressionChecker } from './expressions/IdentifierExpressionChecker';
import { LiteralExpressionChecker } from './expressions/LiteralExpressionChecker';
import { UnaryExpressionChecker } from './expressions/UnaryExpressionChecker';
import { ExpressionStatementChecker } from './ExpressionStatementChecker';
import { ExternChecker } from './ExternChecker';
import { FileChecker } from './FileChecker';
import { FunctionChecker } from './FunctionChecker';
import { FunctionParameterChecker } from './FunctionParameterChecker';
import { IfStatementChecker } from './IfStatementChecker';
import { ImportChecker } from './ImportChecker';
import { ReturnStatementChecker } from './ReturnStatementChecker';
import { VariableDeclarationChecker } from './VariableDeclarationChecker';

export const Checkers = {
  File: new FileChecker(),
  Extern: new ExternChecker(),
  Function: new FunctionChecker(),
  FunctionParameter: new FunctionParameterChecker(),
  BasicBlock: new BasicBlockChecker(),
  IfStatement: new IfStatementChecker(),
  VariableDeclaration: new VariableDeclarationChecker(),
  ReturnStatement: new ReturnStatementChecker(),
  ExpressionStatement: new ExpressionStatementChecker(),
  Import: new ImportChecker(),
  Export: new ExportChecker(),
  Expression: {
    Literal: new LiteralExpressionChecker(),
    Call: new CallExpressionChecker(),
    Identifier: new IdentifierExpressionChecker(),
    Group: new GroupExpressionChecker(),
    Binary: new BinaryExpressionChecker(),
    Unary: new UnaryExpressionChecker(),
  },
};
