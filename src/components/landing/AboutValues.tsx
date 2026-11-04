const VALUES = [
  {
    title: "Transparency",
    description:
      "Clear pricing, open communication, and no fine print. You should always know exactly what you're getting.",
  },
  {
    title: "Security first",
    description:
      "Every decision we make starts with the question: does this keep our users' assets safer?",
  },
  {
    title: "Relentless speed",
    description:
      "Markets move fast. Our infrastructure is engineered to keep up, from execution to support.",
  },
  {
    title: "Accessibility",
    description:
      "Institutional-grade tools, designed for traders at every level of experience.",
  },
];

export default function AboutValues() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-cyan">
            Our values
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            What we stand for
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-nova-emerald/30 hover:bg-white/[0.06]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-nova opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <h3 className="text-lg font-semibold text-nova-text">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-nova-muted">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
