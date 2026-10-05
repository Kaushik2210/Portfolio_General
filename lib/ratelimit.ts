import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface LimitConfig {
  /** Namespace so different features never share a quota. */
  name: string;
  limit: number;
  windowSeconds: number;
}

export interface LimitResult {
  ok: boolean;
  retryAfter: number;
}

export const CHAT_LIMIT: LimitConfig = { name: "chat", limit: 12, windowSeconds: 600 };
export const CONTACT_LIMIT: LimitConfig = {
  name: "contact",
  limit: 3,
  windowSeconds: 3600,
};

const upstash = new Map<string, Ratelimit>();

function getUpstash(cfg: LimitConfig): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  let rl = upstash.get(cfg.name);
  if (!rl) {
    rl = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(cfg.limit, `${cfg.windowSeconds} s`),
      prefix: `portfolio-${cfg.name}`,
    });
    upstash.set(cfg.name, rl);
  }
  return rl;
}

// In-memory fallback: per server instance only, enough to blunt a single abuser.
const hits = new Map<string, number[]>();

function memoryLimit(key: string, cfg: LimitConfig): LimitResult {
  const now = Date.now();
  const windowMs = cfg.windowSeconds * 1000;
  const id = `${cfg.name}:${key}`;
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= cfg.limit) {
    hits.set(id, recent);
    return { ok: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export async function checkLimit(key: string, cfg: LimitConfig): Promise<LimitResult> {
  const rl = getUpstash(cfg);
  if (!rl) return memoryLimit(key, cfg);
  try {
    const r = await rl.limit(key);
    return {
      ok: r.success,
      retryAfter: Math.max(0, Math.ceil((r.reset - Date.now()) / 1000)),
    };
  } catch {
    // If Redis is down, degrade to the in-memory limiter rather than failing open.
    return memoryLimit(key, cfg);
  }
}

/** Hash the caller's address so no raw IP is stored in the limiter or logs. */
export function clientKey(headers: Headers): string {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}
