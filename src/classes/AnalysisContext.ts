import type { BaseNode } from '@kina-lang/ast';
import type { KinaCompiler } from '@kina-lang/compiler';

import type { KinaTypeTokenKind } from '../types/type';

export class AnalysisContext {
  private _expectedReturnType: KinaTypeTokenKind | null = null;
  private _expectedReturnASTNode: BaseNode | null = null;
  private _compiler: KinaCompiler;
  private _filePath: string;

  constructor(compiler: KinaCompiler, filePath: string) {
    this._compiler = compiler;
    this._filePath = filePath;
  }

  public setExpectedReturnType(type: KinaTypeTokenKind | null) {
    this._expectedReturnType = type;
  }

  public getExpectedReturnType(): KinaTypeTokenKind | null {
    return this._expectedReturnType;
  }

  public setExpectedReturnASTNode(node: BaseNode | null) {
    this._expectedReturnASTNode = node;
  }

  public getExpectedReturnASTNode(): BaseNode | null {
    return this._expectedReturnASTNode;
  }

  public get compiler(): KinaCompiler {
    return this._compiler;
  }

  public get filePath(): string {
    return this._filePath;
  }
}
