// CORS enforcement for edge functions

const ALLOWED_ORIGINS = [
  'https://gfvhmzhwiwiehucoseld.supabase.co',
  'https://*.lovable.app',
  'http://localhost:8080', // Development
];

export function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  
  return ALLOWED_ORIGINS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return pattern === origin;
  });
}

export function withCORS(response: Response, request: Request): Response {
  const origin = request.headers.get('Origin') ?? '';
  const headers = new Headers(response.headers);
  
  headers.set('Vary', 'Origin');
  
  if (isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    headers.set('Access-Control-Allow-Credentials', 'false');
  }
  
  headers.set('Access-Control-Allow-Headers', 'content-type, authorization, x-client-info, apikey');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createCORSPreflightResponse(request: Request): Response {
  const origin = request.headers.get('Origin') ?? '';
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'content-type, authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
  
  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGINS[0];
    headers['Access-Control-Allow-Credentials'] = 'false';
  }
  
  return new Response(null, { status: 204, headers });
}