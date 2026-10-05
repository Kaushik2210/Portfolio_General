import { ImageResponse } from "next/og";
import { SITE } from "@/lib/data";

export const alt = `${SITE.name}: software, data and AI engineering`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#08090b",
        color: "#ece8e1",
        padding: 72,
      }}
    >
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#9a9ea8" }}>
        PORTFOLIO / 2026
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{ display: "flex", fontSize: 150, fontWeight: 700, lineHeight: 0.95 }}
        >
          {SITE.name}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#ff5a36" }}>
          Software / Data / AI engineering
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#9a9ea8" }}>
        {SITE.location}
      </div>
    </div>,
    size,
  );
}
