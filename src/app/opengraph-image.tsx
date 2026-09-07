import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Patrimo — seu dinheiro inteiro numa tela só";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f5f1",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: "#17141a" }}>
          Patri<span style={{ color: "#ff4d6d" }}>mo</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#17141a", lineHeight: 1.05 }}>
            Seu dinheiro inteiro,
            <br />
            numa tela só.
          </div>
          <div style={{ fontSize: 30, color: "#6b6560" }}>
            Orçamento · Reserva · Metas · Investimentos · Patrimônio · IA
          </div>
        </div>
        <div
          style={{
            height: 10,
            width: "100%",
            background: "linear-gradient(90deg,#ff4d6d,#8b5cf6)",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    size,
  );
}
