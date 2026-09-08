const COLORS = [
  "#0B7A55",
  "#16A06C",
  "#C98A00",
  "#2F8FA8",
  "#7C5CBF",
  "#C0562B",
  "#0A6A4A",
  "#B03A5B",
];

function pick(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

export function CategoryPill({ name, color }: { name: string; color?: string }) {
  const c = color ?? pick(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: `${c}1f`, color: c }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {name}
    </span>
  );
}
