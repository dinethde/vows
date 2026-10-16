import { createHmac } from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath, revalidateTag }));

const SECRET = 'test-only-revalidate-value-0123456789';

function call(body: string, signature?: string): Promise<Response> {
  const sign = signature ?? createHmac('sha256', SECRET).update(body).digest('hex');
  return import('./route').then(({ POST }) =>
    POST(
      new Request('https://test.vows.lk/api/revalidate', {
        method: 'POST',
        body,
        headers: { 'x-vows-signature': sign },
      }),
    ),
  );
}

beforeEach(() => {
  process.env.REVALIDATE_SECRET = SECRET;
  revalidatePath.mockReset();
  revalidateTag.mockReset();
});

describe('POST /api/revalidate', () => {
  it('rebuilds the paths it was sent when the signature is right', async () => {
    const response = await call(
      JSON.stringify({ paths: ['/albums/benali-yasiru', '/'], issuedAt: Date.now() }),
    );
    expect(response.status).toBe(200);
    expect(revalidatePath.mock.calls.map(([path]) => path as string)).toEqual([
      '/albums/benali-yasiru',
      '/',
    ]);
    expect(revalidateTag).toHaveBeenCalledWith('albums');
  });

  it('answers 404, not 401, to a bad signature, and rebuilds nothing', async () => {
    const response = await call(
      JSON.stringify({ paths: ['/'], issuedAt: Date.now() }),
      'f'.repeat(64),
    );
    expect(response.status).toBe(404);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses a correctly signed call that is more than five minutes old', async () => {
    const response = await call(
      JSON.stringify({ paths: ['/'], issuedAt: Date.now() - 6 * 60_000 }),
    );
    expect(response.status).toBe(404);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses a body changed after it was signed', async () => {
    const body = JSON.stringify({ paths: ['/'], issuedAt: Date.now() });
    const signature = createHmac('sha256', SECRET).update(body).digest('hex');
    expect((await call(body.replace('"/"', '"/studio"'), signature)).status).toBe(404);
  });
});
