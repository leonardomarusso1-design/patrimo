"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createRow, updateRow, deleteRow, type MutationState } from "@/app/app/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "money" | "date" | "day" | "select" | "boolean";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  step?: string;
};

/** Linha já renderizada no servidor + os dados crus para preencher o form de edição. */
export type ManagedRow = {
  id: string;
  node: ReactNode;
  raw: Record<string, string | number | boolean | null | undefined>;
};

const empty: MutationState = {};

function FieldInput({
  field,
  defaultValue,
}: {
  field: Field;
  defaultValue?: string | number | null;
}) {
  const common = {
    id: field.name,
    name: field.name,
    required: field.required,
    defaultValue:
      defaultValue != null && defaultValue !== ""
        ? String(defaultValue)
        : field.defaultValue,
  };
  if (field.type === "select") {
    return (
      <Select {...common}>
        {!field.required && <option value="">—</option>}
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    );
  }
  if (field.type === "date") return <Input type="date" {...common} />;
  if (field.type === "day")
    return <Input type="number" min={1} max={31} placeholder="1–31" {...common} />;
  if (field.type === "money" || field.type === "number")
    return (
      <Input
        type="number"
        step={field.step ?? "0.01"}
        min={field.type === "money" ? 0 : undefined}
        placeholder={field.placeholder}
        {...common}
      />
    );
  return <Input type="text" placeholder={field.placeholder} {...common} />;
}

function EntityForm({
  table,
  path,
  fields,
  hidden,
  raw,
  rowId,
  onDone,
}: {
  table: string;
  path: string;
  fields: Field[];
  hidden?: Record<string, string>;
  raw?: ManagedRow["raw"];
  rowId?: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    rowId ? updateRow : createRow,
    empty,
  );

  useEffect(() => {
    // fecha o modal quando a Server Action confirma
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="_table" value={table} />
      <input type="hidden" name="_path" value={path} />
      {rowId && <input type="hidden" name="_id" value={rowId} />}
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      {fields.map((field) =>
        field.type === "boolean" ? (
          <label key={field.name} className="flex items-start gap-2.5 rounded-xl bg-ink/[0.03] p-3 text-sm">
            <input
              type="checkbox"
              name={field.name}
              defaultChecked={raw?.[field.name] === true}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
            />
            <span>
              <span className="font-medium text-ink">{field.label}</span>
              {field.hint && <span className="mt-0.5 block text-xs text-muted">{field.hint}</span>}
            </span>
          </label>
        ) : (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <FieldInput
              field={field}
              defaultValue={raw?.[field.name] as string | number | null | undefined}
            />
          </div>
        ),
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {rowId ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

export function AddButton({
  table,
  path,
  fields,
  hidden,
  label = "Adicionar",
  title,
  fullWidth,
  size = "sm",
  autoOpen = false,
}: {
  table: string;
  path: string;
  fields: Field[];
  hidden?: Record<string, string>;
  label?: string;
  title?: string;
  fullWidth?: boolean;
  size?: "sm" | "md";
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen);
  return (
    <>
      <Button size={size} onClick={() => setOpen(true)} className={fullWidth ? "w-full" : undefined}>
        {!fullWidth && <Plus className="h-4 w-4" />} {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title ?? label}>
        <EntityForm
          table={table}
          path={path}
          fields={fields}
          hidden={hidden}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

function RowActions({
  table,
  path,
  fields,
  row,
}: {
  table: string;
  path: string;
  fields: Field[];
  row: ManagedRow;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex shrink-0 gap-1">
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-muted hover:bg-ink/[0.06] hover:text-ink"
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <form action={deleteRow}>
        <input type="hidden" name="_table" value={table} />
        <input type="hidden" name="_path" value={path} />
        <input type="hidden" name="_id" value={row.id} />
        <button
          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
          aria-label="Excluir"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </form>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar">
        <EntityForm
          table={table}
          path={path}
          fields={fields}
          raw={row.raw}
          rowId={row.id}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}

export function EntityManager({
  table,
  path,
  title = "Itens",
  addLabel = "Adicionar",
  fields,
  hidden,
  rows,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
  flat,
  filterable,
  autoOpen,
}: {
  table: string;
  path: string;
  title?: string;
  addLabel?: string;
  fields: Field[];
  hidden?: Record<string, string>;
  rows: ManagedRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  flat?: boolean;
  filterable?: boolean;
  autoOpen?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Set<string>>(new Set());

  const rowTags = (r: ManagedRow) =>
    String(r.raw.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const allCats = filterable
    ? Array.from(
        new Set(
          rows
            .map((r) => (r.raw.category ? String(r.raw.category) : null))
            .filter((c): c is string => !!c),
        ),
      ).sort()
    : [];

  const allTags = filterable
    ? Array.from(new Set(rows.flatMap(rowTags))).sort()
    : [];

  const visible =
    filterable && (query || cats.size || tags.size)
      ? rows.filter((r) => {
          const name = String(r.raw.name ?? "").toLowerCase();
          const cat = r.raw.category ? String(r.raw.category) : "";
          const rts = rowTags(r);
          const q = query.toLowerCase();
          if (
            query &&
            !name.includes(q) &&
            !rts.some((t) => t.toLowerCase().includes(q))
          )
            return false;
          if (cats.size && !cats.has(cat)) return false;
          if (tags.size && !rts.some((t) => tags.has(t))) return false;
          return true;
        })
      : rows;

  return (
    <div
      className={
        flat
          ? ""
          : "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
      }
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          flat ? "pb-3" : "border-b border-border p-4",
        )}
      >
        <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
        <AddButton
          table={table}
          path={path}
          fields={fields}
          hidden={hidden}
          label={addLabel}
          autoOpen={autoOpen}
        />
      </div>

      {filterable && rows.length > 0 && (
        <div className={cn("space-y-2.5", flat ? "pb-3" : "px-4 pt-4")}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou tag…"
            className="h-9"
          />
          {allCats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allCats.map((c) => {
                const on = cats.has(c);
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setCats((s) => {
                        const n = new Set(s);
                        if (n.has(c)) n.delete(c);
                        else n.add(c);
                        return n;
                      })
                    }
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      on ? "bg-brand text-[#eaf5ee]" : "bg-ink/[0.05] text-muted hover:text-ink",
                    )}
                  >
                    {c}
                  </button>
                );
              })}
              {cats.size > 0 && (
                <button
                  onClick={() => setCats(new Set())}
                  className="rounded-full px-2.5 py-1 text-xs text-accent-dim"
                >
                  limpar
                </button>
              )}
            </div>
          )}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => {
                const on = tags.has(t);
                return (
                  <button
                    key={t}
                    onClick={() =>
                      setTags((s) => {
                        const n = new Set(s);
                        if (n.has(t)) n.delete(t);
                        else n.add(t);
                        return n;
                      })
                    }
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      on ? "bg-ink text-[#eaf5ee]" : "bg-ink/[0.05] text-muted hover:text-ink",
                    )}
                  >
                    #{t}
                  </button>
                );
              })}
              {tags.size > 0 && (
                <button
                  onClick={() => setTags(new Set())}
                  className="rounded-full px-2.5 py-1 text-xs text-accent-dim"
                >
                  limpar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-4">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : visible.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted">
          Nenhum item bate com o filtro.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {visible.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3.5 text-sm">
              <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                {row.node}
              </div>
              <RowActions table={table} path={path} fields={fields} row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
