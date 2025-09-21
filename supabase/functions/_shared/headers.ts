// Security headers for edge functions

export const SEC_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://*.supabase.co https://*.googleapis.com",
    "style-src 'self' 'unsafe-inline'", 
    "img-src 'self' data: blob: https://*.googleapis.com",
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
};

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  Object.entries(SEC_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createSecureResponse(
  data: any,
  options: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const baseHeaders = {
    'Content-Type': 'application/json',
    ...SEC_HEADERS,
    ...options.headers,
  };
  
  return new Response(JSON.stringify(data), {
    status: options.status ?? 200,
    headers: baseHeaders,
  });
}