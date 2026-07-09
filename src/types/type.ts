import type { TokenKind } from '@kina-lang/lexer';

export const UDT_PREFIX = 'udt.' as const;

export type KinaTypeTokenKind =
  | TokenKind.TypeBool
  | TokenKind.TypeInt
  | TokenKind.TypeVoid
  | TokenKind.TypeString
  | TokenKind.TypePtr
  | '___kina_internal_string'
  | `${typeof UDT_PREFIX}${string}`;

export function makeUserDefinedTypeKind(name: string): KinaTypeTokenKind {
  return `${UDT_PREFIX}${name}` as KinaTypeTokenKind;
}

export function isUserDefinedTypeKind(type: KinaTypeTokenKind): boolean {
  return typeof type === 'string' && type.startsWith(UDT_PREFIX);
}

export function getUserDefinedTypeName(type: KinaTypeTokenKind): string | null {
  if (!isUserDefinedTypeKind(type)) return null;

  return (type as string).slice(UDT_PREFIX.length);
}
