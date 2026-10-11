import { describe, expect, it } from 'vitest';

import { decodeCursor, encodeCursor } from './cursor';
import { ValidationError } from './errors/domain-error';

describe('cursor', () => {
  it('comes back as the sort key and id it was made from', () => {
    const cursor = { createdAt: new Date('2026-10-09T08:30:00.000Z'), id: 'enq_0041aa' };
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it.each(['', 'not-base64!', Buffer.from('{"c":"never","i":1}').toString('base64url')])(
    'refuses %j as a bad request, not a crash',
    (value) => {
      expect(() => decodeCursor(value)).toThrow(ValidationError);
    },
  );
});
