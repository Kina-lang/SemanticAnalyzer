import type {
  FileNode
} from '@kina-lang/ast';

import { BaseChecker } from './_base';
import { KinaSemanticAnalyzer } from '../KinaSemanticAnalyzer';
import type { Scope } from '../Scope';

export class FileChecker extends BaseChecker {
  constructor() {
    super();
  }

  override check(node: FileNode, scope: Scope) {
    for (const subNode of node.nodes) {
      KinaSemanticAnalyzer.checkNode(subNode, scope);
    }
  }
}
