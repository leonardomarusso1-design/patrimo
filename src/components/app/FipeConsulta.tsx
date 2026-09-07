"use client";

import { useActionState, useEffect, useState } from "react";
import { Car } from "lucide-react";
import { createRow, type MutationState } from "@/app/app/actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Field";
import { parseBRNumber } from "@/lib/csv";
import { formatCurrency } from "@/lib/utils";

type Opt = { codigo: string; nome: string };
const empty: MutationState = {};

async function fipe(params: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`/api/fipe?${q}`);
  if (!res.ok) throw new Error("fipe");
  return res.json();
}

export function FipeConsulta() {
  const [open, setOpen] = useState(false);
  const [marcas, setMarcas] = useState<Opt[]>([]);
  const [modelos, setModelos] = useState<Opt[]>([]);
  const [anos, setAnos] = useState<Opt[]>([]);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [result, setResult] = useState<{
    nome: string;
    valor: number;
    codigo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, action, pending] = useActionState(createRow, empty);

  useEffect(() => {
    if (open && marcas.length === 0) {
      fipe({ step: "marcas" }).then(setMarcas).catch(() => {});
    }
  }, [open, marcas.length]);

  useEffect(() => {
    // fecha quando a Server Action confirma a criação do item
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      setResult(null);
    }
  }, [state.ok]);

  async function pickMarca(v: string) {
    setMarca(v);
    setModelo("");
    setAno("");
    setModelos([]);
    setAnos([]);
    setResult(null);
    if (!v) return;
    const d = await fipe({ step: "modelos", marca: v });
    setModelos(d.modelos ?? []);
  }
  async function pickModelo(v: string) {
    setModelo(v);
    setAno("");
    setAnos([]);
    setResult(null);
    if (!v) return;
    const d = await fipe({ step: "anos", marca, modelo: v });
    setAnos(Array.isArray(d) ? d : []);
  }
  async function pickAno(v: string) {
    setAno(v);
    setResult(null);
    if (!v) return;
    setLoading(true);
    try {
      const d = await fipe({ step: "valor", marca, modelo, ano: v });
      setResult({
        nome: d.Modelo ?? "Veículo",
        valor: parseBRNumber(String(d.Valor ?? "")) ?? 0,
        codigo: d.CodigoFipe ?? "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:border-brand/40 hover:text-brand"
      >
        <Car className="h-4 w-4" /> Consultar FIPE
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Tabela FIPE — veículo">
        <div className="space-y-3">
          <div>
            <Label>Marca</Label>
            <Select value={marca} onChange={(e) => pickMarca(e.target.value)}>
              <option value="">Selecione…</option>
              {marcas.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </div>
          {modelos.length > 0 && (
            <div>
              <Label>Modelo</Label>
              <Select value={modelo} onChange={(e) => pickModelo(e.target.value)}>
                <option value="">Selecione…</option>
                {modelos.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    {m.nome}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {anos.length > 0 && (
            <div>
              <Label>Ano</Label>
              <Select value={ano} onChange={(e) => pickAno(e.target.value)}>
                <option value="">Selecione…</option>
                {anos.map((a) => (
                  <option key={a.codigo} value={a.codigo}>
                    {a.nome}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {loading && <p className="text-sm text-muted">Consultando…</p>}

          {result && (
            <form action={action} className="rounded-xl bg-brand-50 p-4">
              <input type="hidden" name="_table" value="patrimony_items" />
              <input type="hidden" name="_path" value="/app/patrimonio" />
              <input type="hidden" name="kind" value="veiculo" />
              <input type="hidden" name="name" value={result.nome} />
              <input type="hidden" name="value" value={result.valor} />
              <input type="hidden" name="appraised_value" value={result.valor} />
              <input type="hidden" name="fipe_code" value={result.codigo} />
              <p className="font-display text-sm font-bold text-brand-700">{result.nome}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                {formatCurrency(result.valor)}
              </p>
              <p className="text-xs text-brand-700/80">FIPE {result.codigo}</p>
              {state.error && (
                <p className="mt-2 text-sm text-danger">{state.error}</p>
              )}
              <Button type="submit" className="mt-3 w-full" loading={pending}>
                Adicionar como veículo no Patrimônio
              </Button>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
