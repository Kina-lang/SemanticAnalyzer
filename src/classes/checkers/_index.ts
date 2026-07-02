import { BasicBlockChecker } from './BasicBlockChecker';
import { LiteralExpressionChecker } from './expressions/LiteralExpressionChecker';
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
  Expression: {
    Literal: new LiteralExpressionChecker(),
  },
};
