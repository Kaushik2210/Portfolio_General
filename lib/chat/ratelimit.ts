import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const LIMIT = 12; // requests
const WINDOW_S = 10 * 60; // per 10 minutes, per client

export interface LimitResult {
  ok: boolean;
  retryAfter: number;
}

let upstash: Ratelimit | null | undefined;

function getUpstash(): Ratelimit | null {
  if (upstash !== undefined) return upstash;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  upstash =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(LIMIT, `${WINDOW_S} s`),
          prefix: "portfolio-chat",
        })
      : null;
  return upstash;
}

// In-memory fallback: per instance only, which is enough to blunt a single abuser.
const hits = new Map<string, number[]>();

function memoryLimit(key: string): LimitResult {
  const now = Date.now();
  const windowMs = WINDOW_S * 1000;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export async function checkLimit(key: string): Promise<LimitResult> {
  const rl = getUpstash();
  if (!rl) return memoryLimit(key);
  try {
    const r = await rl.limit(key);
    return {
      ok: r.success,
      retryAfter: Math.max(0, Math.ceil((r.reset - Date.now()) / 1000)),
    };
  } catch {
    // If Redis is down, degrade to the in-memory limiter rather than failing open.
    return memoryLimit(key);
  }
}
