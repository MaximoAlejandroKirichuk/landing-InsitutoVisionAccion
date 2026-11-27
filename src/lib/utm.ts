/**
 * Campaign tracking (Meta Ads, etc.): reads utm_* params from the landing URL and keeps them for the
 * browser session, so they still reach the leads sheet after the visitor scrolls, opens anchors or reloads.
 */
export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = 'via:utm';
const MAX_LENGTH = 200;

export function parseUtm(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, MAX_LENGTH);
  }
  return utm;
}

/** Browser only: URL params win over what was stored earlier in the session. */
export function captureUtm(): Utm {
  const fromUrl = parseUtm(window.location.search);
  try {
    if (Object.keys(fromUrl).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
    return sanitizeUtm(stored);
  } catch {
    return fromUrl;
  }
}

/** Keeps only known keys with short string values. Safe for untrusted input (server side too). */
export function sanitizeUtm(value: unknown): Utm {
  const utm: Utm = {};
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return utm;
  for (const key of UTM_KEYS) {
    const raw = (value as Record<string, unknown>)[key];
    if (typeof raw === 'string' && raw.trim()) utm[key] = raw.trim().slice(0, MAX_LENGTH);
  }
  return utm;
}
