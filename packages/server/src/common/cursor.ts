import { ValidationError } from './errors/domain-error';

export interface Cursor {
  createdAt: Date;
  id: string;
}

/** Opaque to the caller: the sort key and the id, so paging never drifts. */
export function encodeCursor(cursor: Cursor): string {
  const raw = JSON.stringify({ c: cursor.createdAt.toISOString(), i: cursor.id });
  return Buffer.from(raw).toString('base64url');
}

export function decodeCursor(value: string): Cursor {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      c?: unknown;
      i?: unknown;
    };
    const createdAt = new Date(String(parsed.c));
    if (typeof parsed.i !== 'string' || Number.isNaN(createdAt.getTime())) throw new Error('shape');
    return { createdAt, id: parsed.i };
  } catch {
    throw new ValidationError({ cursor: 'That cursor is not one we gave out.' });
  }
}
