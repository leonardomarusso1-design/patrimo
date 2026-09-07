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
          background: "linear-gradient(135deg, #0b7a55 0%, #08573d 100%)",
          color: "#eaf5ee",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>Patrimo</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 74,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          <span>Seu dinheiro inteiro,</span>
          <span>numa tela só.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#eaf5ee" }}>
          Orçamento · Reserva · Metas · Investimentos · Patrimônio · IA
        </div>
      </div>
    ),
    size,
  );
}
