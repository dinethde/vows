import { describe, expect, it } from 'vitest';

import { signVisitor, visitorAddress } from './visitor';

const SECRET = 'a-secret-used-only-in-this-test-0123456789';
const WEB_SERVER = '76.76.21.21';
const VISITOR = '203.0.113.7';

describe('whose enquiry it is', () => {
  it('is the visitor when the web app signed their address', () => {
    const claim = {
      connection: WEB_SERVER,
      claimed: VISITOR,
      signature: signVisitor(VISITOR, SECRET),
    };
    expect(visitorAddress(claim, SECRET)).toBe(VISITOR);
  });

  it('is the connection when nothing was claimed', () => {
    const claim = { connection: VISITOR, claimed: undefined, signature: undefined };
    expect(visitorAddress(claim, SECRET)).toBe(VISITOR);
  });

  it('ignores an address nobody signed, so a caller cannot choose one', () => {
    const claim = { connection: VISITOR, claimed: '198.51.100.1', signature: undefined };
    expect(visitorAddress(claim, SECRET)).toBe(VISITOR);
  });

  it('ignores a signature made for another address or with another secret', () => {
    const other = {
      connection: WEB_SERVER,
      claimed: VISITOR,
      signature: signVisitor('198.51.100.1', SECRET),
    };
    const forged = {
      connection: WEB_SERVER,
      claimed: VISITOR,
      signature: signVisitor(VISITOR, 'x'.repeat(40)),
    };
    expect(visitorAddress(other, SECRET)).toBe(WEB_SERVER);
    expect(visitorAddress(forged, SECRET)).toBe(WEB_SERVER);
  });
});
