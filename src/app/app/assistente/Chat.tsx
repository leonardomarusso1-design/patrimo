"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { askAssistant } from "./actions";
import type { ChatMsg } from "@/lib/finance-chat";

const SUGGESTIONS = [
  "Como está meu mês?",
  "Onde consigo cortar gastos?",
  "Já posso aumentar meus aportes?",
  "Quanto falta pra minha reserva de emergência?",
];

export function Chat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, pending]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || pending) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setError(null);
    setPending(true);
    const res = await askAssistant(next);
    setPending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setMsgs([...next, { role: "assistant", content: res.reply ?? "" }]);
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.length === 0 && (
          <div className="mx-auto max-w-md py-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-brand" />
            <p className="mt-2 text-sm text-muted">
              Pergunte sobre seus números — orçamento, metas, reserva, dívidas.
              Sem indicação de ativo pra comprar; não é consultoria registrada.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                m.role === "user"
                  ? "bg-brand text-white"
                  : "bg-bg text-ink"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {pending && <p className="text-sm text-muted">Pensando…</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua pergunta…"
          maxLength={800}
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
