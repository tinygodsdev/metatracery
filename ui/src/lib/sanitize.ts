import DOMPurify from 'dompurify';

/** Inline SVG from grammar output — strips scripts and event handlers. */
export function sanitizeSvg(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });
}

/** HTML produced from markdown — default profile. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}
