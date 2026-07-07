// Best-effort, in-process rate limiting for the network's public API routes
// (checkout, subscribe, analytics). Deliberately NOT a durable cross-instance limiter —
// that needs Vercel KV or Upstash Redis, a real infra decision with its own cost, and
// nobody's provisioned that yet. This in-memory version resets on every cold start and
// doesn't share state across concurrent serverless instances, so a determined abuser
// spread across instances isn't actually stopped — but it does stop the common case (one
// instance getting hammered by one client) at zero cost and zero new dependencies. Treat
// this as the honest first step, not the final answer; upgrade to KV/Redis if abuse
// actually shows up in the logs.
const buckets = new Map<string, number[]>();

// Bound memory: an unbounded Map on a long-lived instance is its own small liability.
const MAX_TRACKED_KEYS = 5000;

export type RateLimitResult = { allowed: boolean; remaining: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);

  if (buckets.size > MAX_TRACKED_KEYS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }

  return { allowed: true, remaining: limit - timestamps.length };
}

/** Best-effort client identifier from standard proxy headers (Vercel sets x-forwarded-for). */
export function clientKeyFromHeaders(headers: Headers, routeName: string): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${routeName}:${ip}`;
}
