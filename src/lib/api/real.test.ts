import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitFunnelReal } from './real';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('submitFunnelReal()', () => {
  it('posts to the local funnel endpoint when no public URL is configured', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ submissionId: 'submission-123' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await submitFunnelReal({} as never);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/funnel-submissions',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(result).toEqual({ ok: true, submissionId: 'submission-123' });
  });
});
