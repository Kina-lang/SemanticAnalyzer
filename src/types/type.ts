import type { TokenKind } from '@kina-lang/lexer';

export type KinaTypeTokenKind =
  | TokenKind.TypeBool
  | TokenKind.TypeInt
  | TokenKind.TypeVoid
  | TokenKind.TypeString
  | TokenKind.TypePtr;
