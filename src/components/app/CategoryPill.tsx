const COLORS = [
  "#0B7A55",
  "#16A06C",
  "#C98A00",
  "#4FBF8B",
  "#0A6A4A",
  "#2F8FA8",
  "#8A6D3B",
  "#5B6660",
];

function pick(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function CategoryPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-2 py-0.5 text-xs text-muted">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: pick(name) }}
      />
      {name}
    </span>
  );
}
