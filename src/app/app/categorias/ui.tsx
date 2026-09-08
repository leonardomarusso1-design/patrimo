"use client";

import { useActionState, useState } from "react";
import { Plus, Pencil, Archive, ArchiveRestore, Trash2, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { Tables } from "@/types/database";
import {
  createCategory,
  updateCategory,
  toggleArchive,
  deleteCategory,
  type CatState,
} from "./actions";

type Cat = Tables<"budget_categories">;
type Bucket = "income" | "expense";

const PALETTE = [
  "#2F6BFF", "#E8C33A", "#7BC043", "#E5484D", "#4FC3E8",
  "#F08A24", "#7C5CBF", "#2E7D32", "#E24AA0", "#1A2E5C",
  "#E0A021", "#7A1F1F", "#5C8A8A", "#A78BDA", "#B9D9EB",
  "#B03A5B", "#B5A21F", "#7A2E7A", "#3DD9A0", "#F4C7E4",
];

function ColorDot({ color }: { color: string }) {
  return <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />;
}

function Row({ c }: { c: Cat }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);
  const [color, setColor] = useState(c.color);

  return (
    <li className="flex items-center gap-3 border-b border-border py-2.5 last:border-0">
      <ColorDot color={c.color} />
      <span className={c.archived ? "flex-1 text-sm text-muted line-through" : "flex-1 text-sm text-ink"}>
        {c.name}
      </span>
      <div className="flex gap-1 text-muted">
        <button onClick={() => setEditing(true)} className="rounded-lg p-1.5 hover:bg-ink/[0.06] hover:text-ink" aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </button>
        <form action={toggleArchive}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="archived" value={c.archived ? "0" : "1"} />
          <button className="rounded-lg p-1.5 hover:bg-ink/[0.06] hover:text-ink" aria-label={c.archived ? "Reativar" : "Arquivar"}>
            {c.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </button>
        </form>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={c.id} />
          <button className="rounded-lg p-1.5 hover:bg-danger/10 hover:text-danger" aria-label="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar categoria">
        <form
          action={async (fd) => {
            fd.set("id", c.id);
            fd.set("name", name);
            fd.set("color", color);
            await updateCategory(fd);
            setEditing(false);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor={`n-${c.id}`}>Nome</Label>
            <Input id={`n-${c.id}`} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {PALETTE.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setColor(p)}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: p }}
                >
                  {color.toLowerCase() === p.toLowerCase() && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </li>
  );
}

function AddButton({ bucket }: { bucket: Bucket }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(PALETTE[0]);
  const [state, action, pending] = useActionState<CatState, FormData>(createCategory, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted hover:border-brand/40 hover:text-brand"
      >
        <Plus className="h-3.5 w-3.5" /> Nova
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nova categoria">
        <form
          action={async (fd) => {
            fd.set("bucket", bucket);
            fd.set("color", color);
            await action(fd);
            setOpen(false);
          }}
          className="space-y-4"
        >
          {state.error && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
          )}
          <div>
            <Label htmlFor="cat-name">Nome</Label>
            <Input id="cat-name" name="name" required placeholder="Mercado, Transporte…" />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {PALETTE.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setColor(p)}
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: p }}
                >
                  {color === p && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Adicionar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Section({ title, bucket, cats }: { title: string; bucket: Bucket; cats: Cat[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        <AddButton bucket={bucket} />
      </div>
      {cats.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="mt-3">
          {cats.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function CategoriasUI({ expense, income }: { expense: Cat[]; income: Cat[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Categorias de despesa" bucket="expense" cats={expense} />
      <Section title="Categorias de receita" bucket="income" cats={income} />
    </div>
  );
}
