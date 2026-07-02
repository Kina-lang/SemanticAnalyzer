import { BasicBlockChecker } from './BasicBlockChecker';
import { ExternChecker } from './ExternChecker';
import { FileChecker } from './FileChecker';
import { FunctionChecker } from './FunctionChecker';
import { FunctionParameterChecker } from './FunctionParameterChecker';
import { VariableDeclarationChecker } from './VariableDeclarationChecker';

export const Checkers = {
  File: new FileChecker(),
  Extern: new ExternChecker(),
  Function: new FunctionChecker(),
  FunctionParameter: new FunctionParameterChecker(),
  BasicBlock: new BasicBlockChecker(),
  VariableDeclaration: new VariableDeclarationChecker(),
};
