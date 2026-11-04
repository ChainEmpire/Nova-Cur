export default function AboutHero() {
  return (
    <section className="relative -mt-[69px] overflow-hidden px-6 pt-[calc(4rem+69px)] pb-10 text-center md:pt-[calc(6rem+69px)]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(16,185,129,0.14), transparent 70%), radial-gradient(closest-side at 30% 40%, rgba(139,92,246,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
          Building the <span className="text-gradient-nova">future of trading</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-nova-muted">
          We started novaFi with a simple belief: powerful trading tools
          shouldn&apos;t be reserved for institutions. We&apos;re building
          the infrastructure to make markets accessible, fast, and fair for
          everyone.
        </p>
      </div>
    </section>
  );
}
