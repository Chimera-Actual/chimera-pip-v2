// KV-backed token bucket rate limiting for edge functions

const kv = await Deno.openKv();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export async function rateLimit(
  key: string, 
  limit = 20, 
  windowSec = 60
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSec);
  const bucketKey = ['rl', key, windowStart];
  
  const res = await kv.get<number>(bucketKey);
  const count = (res.value ?? 0) + 1;
  
  if (count === 1) {
    // First request in this window, set with expiration
    await kv.set(bucketKey, count, { expireIn: windowSec * 1000 });
  } else {
    // Increment existing counter
    await kv.set(bucketKey, count);
  }
  
  const resetTime = (windowStart + 1) * windowSec;
  
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetTime
  };
}

export function createRateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };
}

export function createRateLimitResponse(resetTime: number): Response {
  return new Response(
    JSON.stringify({ 
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime 
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now() / 1000)).toString(),
      },
    }
  );
}