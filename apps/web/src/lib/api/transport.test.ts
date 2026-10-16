import { albumSummary, page } from '@vows/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from './errors';
import { createTransport } from './transport';

const fetchMock = vi.fn<typeof fetch>();

function reply(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req_server' },
  });
}

function sent(): { url: string; init: RequestInit & { next?: unknown } } {
  const [url, init] = fetchMock.mock.calls[0] ?? [];
  return { url: typeof url === 'string' ? url : '', init: init ?? {} };
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('the transport', () => {
  it('sets no-store and the bearer token whenever a token is present', async () => {
    fetchMock.mockResolvedValue(reply(204));
    await createTransport(() => Promise.resolve('token-abc'))('/v1/studio/albums');

    const { url, init } = sent();
    expect(url).toBe('https://api.test.vows.lk/v1/studio/albums');
    expect(init.cache).toBe('no-store');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer token-abc');
  });

  it('lets a public read be cached by tag, and sends no token', async () => {
    fetchMock.mockResolvedValue(reply(204));
    await createTransport()('/v1/albums', { next: { tags: ['albums'] } });

    const { init } = sent();
    expect(init.cache).toBeUndefined();
    expect(init.next).toEqual({ tags: ['albums'] });
    expect((init.headers as Record<string, string>).authorization).toBeUndefined();
  });

  it('ignores cache tags on an authenticated call, so two people never share a reply', async () => {
    fetchMock.mockResolvedValue(reply(204));
    await createTransport(() => Promise.resolve('token-abc'))('/v1/studio/albums', {
      next: { tags: ['albums'] },
    });
    expect(sent().init.next).toBeUndefined();
  });

  it('sends a request id and the idempotency key', async () => {
    fetchMock.mockResolvedValue(reply(204));
    await createTransport()('/v1/x', { method: 'POST', body: { a: 1 }, idempotencyKey: 'file-1' });

    const headers = sent().init.headers as Record<string, string>;
    expect(headers['x-request-id']).toMatch(/^req_[0-9a-f]{32}$/);
    expect(headers['idempotency-key']).toBe('file-1');
    expect(sent().init.body).toBe('{"a":1}');
  });

  it('turns an error envelope into an ApiError carrying the code and the field map', async () => {
    fetchMock.mockResolvedValue(
      reply(422, {
        error: {
          code: 'album_not_publishable',
          message: 'This album cannot go out yet.',
          requestId: 'req_1',
          fields: { cover: 'Add a cover photograph.' },
        },
      }),
    );
    const error = await createTransport()('/v1/x').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'album_not_publishable',
      requestId: 'req_1',
      fields: { cover: 'Add a cover photograph.' },
    });
  });

  it('still fails cleanly when the error body is not ours', async () => {
    fetchMock.mockResolvedValue(new Response('<html>bad gateway</html>', { status: 502 }));
    const error = await createTransport()('/v1/x').catch((caught: unknown) => caught);
    expect(error).toMatchObject({ status: 502, code: 'internal_error' });
  });

  it('refuses a reply whose shape has drifted from the contract', async () => {
    fetchMock.mockResolvedValue(reply(200, [{ id: 'alb_000001' }]));
    await expect(createTransport()('/v1/albums', { schema: page(albumSummary) })).rejects.toThrow();
  });
});
