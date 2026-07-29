import { ImageResponse } from "next/og";

// Branded Open Graph / social-share card, generated at request time.
export const alt = "Berto Lucci · Italian Menswear & Tailoring since 1976";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1115 0%, #1a1c22 60%, #0b0c0f 100%)",
          color: "#ece6da",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#cdb892", fontSize: 26, letterSpacing: 10 }}>
          MILANO · EST. 1976
        </div>
        <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: 4, marginTop: 18 }}>BERTO LUCCI</div>
        <div style={{ width: 90, height: 2, background: "#c4a677", margin: "26px 0" }} />
        <div style={{ fontSize: 34, color: "#d8c9b0", letterSpacing: 2 }}>Italian Menswear &amp; Tailoring</div>
      </div>
    ),
    { ...size }
  );
}
