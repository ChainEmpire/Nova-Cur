const MILESTONES = [
  {
    year: "2022",
    title: "novaFi is founded",
    description:
      "A small team of traders and engineers sets out to build a better trading platform.",
  },
  {
    year: "2023",
    title: "Public beta launch",
    description:
      "Spot trading opens to the public with 40 markets and sub-100ms execution.",
  },
  {
    year: "2024",
    title: "Derivatives go live",
    description:
      "Perpetuals and futures launch alongside a developer API and mobile apps.",
  },
  {
    year: "2026",
    title: "250K+ traders",
    description:
      "novaFi now serves a global community of traders across 180+ markets.",
  },
];

export default function AboutStory() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-emerald">
            Milestones
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Our story so far
          </h2>
        </div>

        <ol className="mt-16 space-y-10 border-l border-white/10 pl-8">
          {MILESTONES.map((milestone) => (
            <li key={milestone.year} className="relative">
              <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-nova shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              <span className="text-sm font-semibold text-nova-cyan">
                {milestone.year}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-nova-text">
                {milestone.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-nova-muted">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
