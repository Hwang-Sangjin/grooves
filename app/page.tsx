export default function Home() {
  return (
    <main className="min-h-screen p-12 space-y-4">
      <h1 className="text-6xl font-bold">GROOVES</h1>
      <div className="flex gap-3">
        <div className="w-24 h-24 bg-rust" />
        <div className="w-24 h-24 bg-green" />
        <div className="w-24 h-24 bg-butter border border-ink/20" />
        <div className="w-24 h-24 bg-peach" />
      </div>
      <p className="text-ink/60">muted text는 opacity로 — text-ink/60</p>
      <button className="bg-ink text-cream px-6 py-3">Primary</button>
      <button className="bg-rust text-cream px-6 py-3">Accent</button>
    </main>
  );
}
