import { randomBytes } from 'node:crypto';

import { ID_PREFIXES } from '@vows/contracts';
import type { IdKind } from '@vows/contracts';

const ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';
const LENGTH = 16;

/** `alb_7k2m…`: readable in a log line, and it leaks no row count. */
export function newId(kind: IdKind): string {
  const tail = Array.from(randomBytes(LENGTH), (byte) => ALPHABET[byte % ALPHABET.length]).join('');
  return `${ID_PREFIXES[kind]}_${tail}`;
}
