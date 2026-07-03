import { BasicBlockChecker } from './BasicBlockChecker';
import { CallExpressionChecker } from './expressions/CallExpressionChecker';
import { GroupExpressionChecker } from './expressions/GroupExpressionChecker';
import { IdentifierExpressionChecker } from './expressions/IdentifierExpressionChecker';
import { LiteralExpressionChecker } from './expressions/LiteralExpressionChecker';
import { ExpressionStatementChecker } from './ExpressionStatementChecker';
import { ExternChecker } from './ExternChecker';
import { FileChecker } from './FileChecker';
import { FunctionChecker } from './FunctionChecker';
import { FunctionParameterChecker } from './FunctionParameterChecker';
import { ReturnStatementChecker } from './ReturnStatementChecker';
import { VariableDeclarationChecker } from './VariableDeclarationChecker';

export const Checkers = {
  File: new FileChecker(),
  Extern: new ExternChecker(),
  Function: new FunctionChecker(),
  FunctionParameter: new FunctionParameterChecker(),
  BasicBlock: new BasicBlockChecker(),
  VariableDeclaration: new VariableDeclarationChecker(),
  ReturnStatement: new ReturnStatementChecker(),
  ExpressionStatement: new ExpressionStatementChecker(),
  Expression: {
    Literal: new LiteralExpressionChecker(),
    Call: new CallExpressionChecker(),
    Identifier: new IdentifierExpressionChecker(),
    Group: new GroupExpressionChecker(),
  },
};
