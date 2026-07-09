import { PrimitiveTypeNode, UserDefinedTypeNode, type TypeBaseNode } from '@kina-lang/ast';
import { KinaAssertionError } from '@kina-lang/utils';

import { type KinaTypeTokenKind, makeUserDefinedTypeKind } from '../types/type';

export function resolveASTType(node: TypeBaseNode): KinaTypeTokenKind {
  if (node instanceof PrimitiveTypeNode)
    return node.primitiveKind as KinaTypeTokenKind;

  if (node instanceof UserDefinedTypeNode)
    return makeUserDefinedTypeKind(node.identifier.name);

  throw new KinaAssertionError(`Unknown type node kind: ${node.kind}`);
}
