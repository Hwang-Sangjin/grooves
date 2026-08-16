export default function Home() {
  return (
    <main className="min-h-screen space-y-10 p-12">
      {/* ── 타입 스펙 ── */}
      <section className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink-soft">
          Side A · 33⅓ RPM · Type Specimen
        </p>
        <h1 className="font-display text-8xl uppercase leading-[0.96]">
          Welcome
          <br />
          To Grooves
        </h1>
        <p className="max-w-[34ch] text-sm leading-7">
          Collect, discover, and share the music you love. 서브카피는
          타자기/카탈로그 메타데이터 톤으로.
        </p>
      </section>

      {/* ── 팔레트 ── */}
      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink-soft">
          Palette — Paper &amp; Ink Only
        </p>
        <div className="flex gap-3">
          <div className="h-24 w-24 border border-ink-faint bg-paper-light" />
          <div className="h-24 w-24 border border-ink-faint bg-paper" />
          <div className="h-24 w-24 border border-ink-faint bg-paper-deep" />
          <div className="h-24 w-24 bg-ink" />
          <div className="h-24 w-24 bg-ink-soft" />
        </div>
        <p className="text-sm text-ink-soft">
          muted text는 ink-soft — 웜톤 컬러는 3D scene 머티리얼 전용
        </p>
      </section>

      {/* ── 컴포넌트 톤 체크 ── */}
      <section className="flex flex-wrap items-center gap-6">
        {/* 레코드 라벨 느낌의 primary 버튼 */}
        <button className="flex items-center gap-4 rounded-full bg-ink px-8 py-4 font-display text-lg uppercase tracking-[0.14em] text-paper transition-transform duration-300 hover:-translate-y-0.5">
          Enter Room <span aria-hidden>→</span>
        </button>

        {/* 아웃라인 배지 버튼 */}
        <button className="border-2 border-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.14em]">
          Secondary
        </button>

        {/* 인쇄 마크 스택 */}
        <div className="flex w-max flex-col border-2 border-ink text-center">
          <span className="border-b-2 border-ink px-4 py-1.5 text-sm font-bold tracking-[0.14em]">
            STEREO
          </span>
          <span className="border-b-2 border-ink px-4 py-1.5 text-sm font-bold tracking-[0.14em]">
            33⅓ RPM
          </span>
          <span className="px-4 py-1.5 text-[11px] font-bold tracking-[0.14em]">
            HIGH FIDELITY
          </span>
        </div>

        {/* 하프톤 유틸 체크 */}
        <div className="halftone h-24 w-40 text-ink-soft" />
      </section>
    </main>
  );
}
