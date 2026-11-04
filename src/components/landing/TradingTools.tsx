const TOOLS = [
  {
    title: "Advanced order types",
    description:
      "Market, limit, stop-loss, take-profit, and OCO orders give you precise control over every position.",
  },
  {
    title: "Real-time charting",
    description:
      "TradingView-powered charts with dozens of indicators, drawing tools, and multiple timeframes.",
  },
  {
    title: "Developer API",
    description:
      "REST and WebSocket APIs with low-latency market data and order execution for algorithmic strategies.",
  },
  {
    title: "Portfolio margin",
    description:
      "Cross-margin across spot and derivatives positions to optimize capital efficiency.",
  },
  {
    title: "Mobile trading",
    description:
      "Full-featured iOS and Android apps so you never miss a trade, wherever you are.",
  },
  {
    title: "Smart order routing",
    description:
      "Orders are routed across liquidity pools automatically to secure the best available price.",
  },
];

export default function TradingTools() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-cyan">
            Toolkit
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Tools built for every strategy
          </h2>
          <p className="mt-4 text-nova-muted">
            From first trade to high-frequency algorithms, novaFi scales with
            you.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <div
              key={tool.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-nova-emerald/30 hover:bg-white/[0.06]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-nova opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span className="text-gradient-nova text-sm font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-nova-text">
                {tool.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-nova-muted">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
