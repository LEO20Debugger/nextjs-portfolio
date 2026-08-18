import { siteConfig } from "@/config/site-config";
import { ImageResponse } from "next/server";

export const runtime = "edge";
export const alt = `${siteConfig.creator} — ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Uses the default font rather than the site's SF Pro: Satori can't parse
 * .woff2, and .woff2 is the only format shipped in app/fonts.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Accent wash, echoing the site's primary */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -160,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "#6178F1",
            opacity: 0.22,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#6178F1",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 30, color: "#a3a3a3", letterSpacing: -0.5 }}>
            {siteConfig.title}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: -2.5,
              lineHeight: 1.05,
            }}
          >
            {siteConfig.creator}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#a3a3a3",
              letterSpacing: -0.8,
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {siteConfig.bio}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#737373" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size
  );
}
