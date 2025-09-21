// Tests for KV-backed rate limiting
import { assertEquals, assert } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { rateLimit, createRateLimitHeaders } from "../_shared/rateLimit.ts";

Deno.test("Rate limiting allows requests under limit", async () => {
  const key = `test-${Date.now()}`;
  const limit = 5;
  
  // Should allow first request
  const result1 = await rateLimit(key, limit, 60);
  assertEquals(result1.allowed, true);
  assertEquals(result1.remaining, 4);
  
  // Should allow subsequent requests under limit
  const result2 = await rateLimit(key, limit, 60);
  assertEquals(result2.allowed, true);
  assertEquals(result2.remaining, 3);
});

Deno.test("Rate limiting blocks requests over limit", async () => {
  const key = `test-limit-${Date.now()}`;
  const limit = 2;
  
  // Use up the limit
  await rateLimit(key, limit, 60);
  await rateLimit(key, limit, 60);
  
  // Should block third request
  const result = await rateLimit(key, limit, 60);
  assertEquals(result.allowed, false);
  assertEquals(result.remaining, 0);
});

Deno.test("Rate limit window rollover", async () => {
  const key = `test-rollover-${Date.now()}`;
  const limit = 1;
  const windowSec = 1; // 1 second window
  
  // Use up limit
  const result1 = await rateLimit(key, limit, windowSec);
  assertEquals(result1.allowed, true);
  
  // Immediate second request should be blocked
  const result2 = await rateLimit(key, limit, windowSec);
  assertEquals(result2.allowed, false);
  
  // Wait for window rollover
  await new Promise(resolve => setTimeout(resolve, 1100));
  
  // Should allow request in new window
  const result3 = await rateLimit(key, limit, windowSec);
  assertEquals(result3.allowed, true);
});

Deno.test("Rate limit headers creation", () => {
  const result = {
    allowed: true,
    remaining: 8,
    resetTime: 1672531200
  };
  
  const headers = createRateLimitHeaders(result, 10);
  
  assertEquals(headers['X-RateLimit-Limit'], '10');
  assertEquals(headers['X-RateLimit-Remaining'], '8');
  assertEquals(headers['X-RateLimit-Reset'], '1672531200');
});