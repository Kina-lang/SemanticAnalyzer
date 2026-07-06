import { PrimitiveTypeNode, type TypeBaseNode } from '@kina-lang/ast';
import { KinaAssertionError } from '@kina-lang/utils';

import type { KinaTypeTokenKind } from '../types/type';

export function resolveASTType(node: TypeBaseNode): KinaTypeTokenKind {
  if (node instanceof PrimitiveTypeNode)
    return node.primitiveKind as KinaTypeTokenKind;

  throw new KinaAssertionError(`Unknown type node kind: ${node.kind}`);
}
