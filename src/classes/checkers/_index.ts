import { ExternChecker } from "./ExternChecker";
import { FileChecker } from "./FileChecker";

export const Checkers = {
  File: new FileChecker(),
  Extern: new ExternChecker(),
};
