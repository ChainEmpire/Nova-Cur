export default function TradingHero() {
  return (
    <section className="relative -mt-[69px] overflow-hidden px-6 pt-[calc(4rem+69px)] pb-10 text-center md:pt-[calc(6rem+69px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(16,185,129,0.14), transparent 70%), radial-gradient(closest-side at 70% 40%, rgba(6,182,212,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
          One platform, <span className="text-gradient-nova">every market</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-nova-muted">
          Trade spot, perpetuals, and futures with deep liquidity, advanced
          order types, and real-time execution.
        </p>
      </div>
    </section>
  );
}
