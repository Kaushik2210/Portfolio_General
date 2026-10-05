import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { z } from "zod";
import { systemPrompt } from "@/lib/chat/context";
import { checkLimit } from "@/lib/chat/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = "claude-sonnet-5-5";
const MAX_BODY = 60_000;
const MAX_TURNS = 20;
const CHAT_CHARS = 1500;
const FIT_CHARS = 6500;

const Body = z.object({
  mode: z.enum(["chat", "fit"]).default("chat"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
    .min(1)
    .max(MAX_TURNS),
});

const json = (status: number, error: string, extra?: Record<string, unknown>) =>
  Response.json(
    { error, ...extra },
    { status, headers: { "Cache-Control": "no-store" } },
  );

/** Hash the client address so no raw IP is stored in the limiter or logs. */
function clientKey(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

/** Lets the UI choose the offline state up front. Reveals nothing but availability. */
export function GET() {
  return Response.json(
    { available: Boolean(process.env.ANTHROPIC_API_KEY) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(503, "offline");

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, "too_large");

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(JSON.parse(raw));
  } catch {
    return json(400, "bad_request");
  }

  const { mode, messages } = parsed;
  const limit = mode === "fit" ? FIT_CHARS : CHAT_CHARS;
  const ordered = messages.every(
    (m, i) => m.role === (i % 2 === 0 ? "user" : "assistant"),
  );
  const tooLong = messages.some(
    (m) => m.content.length > (m.role === "user" ? limit : 8000),
  );
  if (!ordered || messages.at(-1)?.role !== "user" || tooLong)
    return json(400, "bad_request");

  const rl = await checkLimit(clientKey(req));
  if (!rl.ok) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfter), "Cache-Control": "no-store" },
      },
    );
  }

  // Pasted job descriptions are untrusted data: fence them so they read as content.
  const apiMessages = messages.map((m, i) =>
    mode === "fit" && i === 0 && m.role === "user"
      ? { role: m.role, content: `<job_description>\n${m.content}\n</job_description>` }
      : m,
  );

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey, maxRetries: 1 });

  const stream = client.beta.messages.stream({
    model,
    max_tokens: 2048,
    system: systemPrompt(mode),
    messages: apiMessages,
    output_config: { effort: "low" },
    // On a safety decline, the API re-runs the request on a fallback model.
    ...(model === DEFAULT_MODEL
      ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
      : {}),
  });

  const it = stream[Symbol.asyncIterator]();
  const enc = new TextEncoder();
  let refused = false;

  /** Pull the next text delta, or null when the stream ends. */
  async function nextText(
    first?: IteratorResult<Anthropic.Beta.BetaRawMessageStreamEvent>,
  ) {
    let step = first ?? (await it.next());
    while (!step.done) {
      const ev = step.value;
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta")
        return ev.delta.text;
      if (ev.type === "message_delta" && ev.delta.stop_reason === "refusal")
        refused = true;
      step = await it.next();
    }
    return null;
  }

  // Resolve the first event before replying, so auth/limit errors become real HTTP statuses.
  let firstText: string | null;
  try {
    firstText = await nextText();
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError)
      return json(429, "rate_limited", { retryAfter: 30 });
    if (
      err instanceof Anthropic.AuthenticationError ||
      err instanceof Anthropic.PermissionDeniedError
    )
      return json(503, "offline");
    if (err instanceof Anthropic.APIError) return json(502, "upstream");
    return json(500, "error");
  }

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (firstText) controller.enqueue(enc.encode(firstText));
        let t: string | null;
        while ((t = await nextText()) !== null) controller.enqueue(enc.encode(t));
        if (refused) {
          controller.enqueue(
            enc.encode(
              "\n\nI can't help with that one. Ask me about Kaushik's work instead.",
            ),
          );
        }
      } catch {
        controller.enqueue(
          enc.encode("\n\n[The response was interrupted. Please try again.]"),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
