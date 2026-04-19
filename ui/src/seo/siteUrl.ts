/** Production default; override with VITE_PUBLIC_SITE_URL (no trailing slash). */
export function getSiteOrigin(): string {
  const raw = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  const base = (raw?.trim() || 'https://grammar.tinygods.dev').replace(/\/$/, '');
  return base;
}

export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteOrigin()}${p}`;
}
