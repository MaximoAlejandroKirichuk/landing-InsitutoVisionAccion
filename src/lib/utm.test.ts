import { describe, expect, it } from 'vitest';
import { parseUtm, sanitizeUtm } from './utm';

describe('utm', () => {
  it('reads only the utm_* params from a landing URL', () => {
    expect(parseUtm('?utm_source=facebook&utm_campaign=enero&fbclid=abc&utm_term=')).toEqual({
      utm_source: 'facebook',
      utm_campaign: 'enero',
    });
  });

  it('drops unknown keys, non-strings and trims long values', () => {
    expect(sanitizeUtm({ utm_source: 'a'.repeat(300), utm_medium: 4, other: 'x' })).toEqual({ utm_source: 'a'.repeat(200) });
    expect(sanitizeUtm('nope')).toEqual({});
    expect(sanitizeUtm(null)).toEqual({});
  });
});
