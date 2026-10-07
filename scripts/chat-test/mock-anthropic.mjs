import http from "node:http";
import fs from "node:fs";
const out = process.argv[2] || "last-call.json";
let calls = 0;
http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      calls++;
      const parsed = JSON.parse(body || "{}");
      fs.writeFileSync(
        out,
        JSON.stringify({ calls, url: req.url, headers: req.headers, body: parsed }),
      );
      const lastUser = JSON.stringify(parsed.messages?.at(-1)?.content ?? "");
      const err = (status, type) => {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ type: "error", error: { type, message: type } }));
      };
      if (lastUser.includes("TRIGGER_401")) return err(401, "authentication_error");
      if (lastUser.includes("TRIGGER_429")) return err(429, "rate_limit_error");
      if (lastUser.includes("TRIGGER_500")) return err(500, "api_error");
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const ev = (t, d) =>
        res.write(`event: ${t}\ndata: ${JSON.stringify({ type: t, ...d })}\n\n`);
      ev("message_start", {
        message: {
          id: "msg_1",
          type: "message",
          role: "assistant",
          model: "claude-sonnet-5-5",
          content: [],
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 10, output_tokens: 1 },
        },
      });
      ev("content_block_start", { index: 0, content_block: { type: "text", text: "" } });
      const refuse = lastUser.includes("TRIGGER_REFUSAL");
      const chunks = refuse
        ? ["Sorry, "]
        : lastUser.includes("job_description")
          ? [
              "**Where he fits**\n- ",
              "[Orbital Sentinel](/work/orbital-sentinel)\n\n**Gaps and unknowns**\n- No evidence of Kubernetes.\n\n**Overall** Partial match.",
            ]
          : ["He built ", "[Orbital Sentinel](/work/orbital-sentinel) ", "with PyTorch."];
      for (const t of chunks)
        ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: t } });
      ev("content_block_stop", { index: 0 });
      ev("message_delta", {
        delta: { stop_reason: refuse ? "refusal" : "end_turn", stop_sequence: null },
        usage: { output_tokens: 9 },
      });
      ev("message_stop", {});
      res.end();
    });
  })
  .listen(4011);
