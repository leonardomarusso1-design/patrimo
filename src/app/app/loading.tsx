// Skeleton instantâneo enquanto o Server Component busca os dados.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-52 rounded-lg bg-ink/[0.06]" />
        <div className="h-4 w-72 rounded bg-ink/[0.05]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-border bg-card" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-2xl border border-border bg-card" />
        <div className="h-48 rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}
