type Bucket = {
  count: number;
  firstAt: number;
  lockedUntil: number;
};

const buckets = new Map<string, Bucket>();

type Options = {
  max: number;
  windowMs: number;
  lockMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function checkAndConsume(key: string, opts: Options): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (bucket && bucket.lockedUntil > now) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  if (!bucket || now - bucket.firstAt > opts.windowMs) {
    buckets.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return { ok: true, remaining: opts.max - 1, retryAfterSec: 0 };
  }

  bucket.count += 1;

  if (bucket.count > opts.max) {
    bucket.lockedUntil = now + opts.lockMs;
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil(opts.lockMs / 1000),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, opts.max - bucket.count),
    retryAfterSec: 0,
  };
}

export function resetKey(key: string): void {
  buckets.delete(key);
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets) {
      if (b.lockedUntil < now && now - b.firstAt > 30 * 60_000) {
        buckets.delete(key);
      }
    }
  }, 5 * 60_000).unref?.();
}
