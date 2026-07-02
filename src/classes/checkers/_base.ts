import type { BaseNode } from '@kina-lang/ast';

import type { Scope } from '../Scope';

export abstract class BaseChecker {
  abstract check(node: BaseNode, scope: Scope): void;
}
