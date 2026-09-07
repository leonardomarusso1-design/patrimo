"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createRow, updateRow, deleteRow, type MutationState } from "@/app/app/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Misc";

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "money" | "date" | "day" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  step?: string;
};

export type Column<Row> = {
  header: string;
  cell: (row: Row) => React.ReactNode;
  className?: string;
};

type RowLike = { id: string } & Record<string, unknown>;

const empty: MutationState = {};

function FieldInput({ field, defaultValue }: { field: Field; defaultValue?: unknown }) {
  const common = {
    id: field.name,
    name: field.name,
    required: field.required,
    defaultValue: defaultValue != null ? String(defaultValue) : field.defaultValue,
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
  row,
  onDone,
}: {
  table: string;
  path: string;
  fields: Field[];
  hidden?: Record<string, string>;
  row?: RowLike;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    row ? updateRow : createRow,
    empty,
  );

  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="_table" value={table} />
      <input type="hidden" name="_path" value={path} />
      {row && <input type="hidden" name="_id" value={row.id} />}
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          <FieldInput field={field} defaultValue={row?.[field.name]} />
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {row ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

export function QuickCreate({
  table,
  path,
  fields,
  hidden,
  label = "Adicionar",
  title,
  trigger,
}: {
  table: string;
  path: string;
  fields: Field[];
  hidden?: Record<string, string>;
  label?: string;
  title?: string;
  trigger?: (open: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> {label}
        </Button>
      )}
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

export function EntityManager<Row extends RowLike>({
  table,
  path,
  title,
  addLabel = "Adicionar",
  fields,
  hidden,
  rows,
  columns,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
}: {
  table: string;
  path: string;
  title?: string;
  addLabel?: string;
  fields: Field[];
  hidden?: Record<string, string>;
  rows: Row[];
  columns: Column<Row>[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <h3 className="font-display text-base font-bold text-ink">{title ?? "Itens"}</h3>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="p-4">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-4 px-4 py-3.5 text-sm"
            >
              <div className="grid flex-1 gap-1 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
                {columns.map((col, i) => (
                  <span key={i} className={col.className}>
                    {col.cell(row)}
                  </span>
                ))}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(row)}
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
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title={addLabel}
        description="Preencha os campos abaixo."
      >
        <EntityForm
          table={table}
          path={path}
          fields={fields}
          hidden={hidden}
          onDone={() => setAdding(false)}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar"
      >
        {editing && (
          <EntityForm
            table={table}
            path={path}
            fields={fields}
            hidden={hidden}
            row={editing}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
