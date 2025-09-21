// config/csp.ts
/**
 * Central CSP used for dev/preview HTTP headers.
 * NOTE: frame-ancestors MUST be in HTTP headers (ignored in <meta>).
 */
export const CSP_HEADER = [
  "default-src 'self'",
  "base-uri 'self'",
  // scripts (no unsafe-eval unless you truly need it)
  "script-src 'self'",
  // styles: allow inline (Tailwind/shadcn) + Google Fonts CSS
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // fonts: allow Google Fonts font files + data: (embedded)
  "font-src 'self' data: https://fonts.gstatic.com",
  // images: local + data/blob (icons, screenshots)
  "img-src 'self' data: blob:",
  // XHR/WebSocket targets (Supabase + your APIs)
  "connect-src 'self' https://*.supabase.co https://*.supabase.in",
  // absolutely forbid framing
  "frame-ancestors 'self' https://*.lovable.dev https://*.lovableproject.com",
].join('; ');