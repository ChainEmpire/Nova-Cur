import { LazyMotion, domAnimation, m } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";

const FEATURES = [
  {
    title: "Lightning-fast execution",
    description:
      "Our matching engine processes orders in milliseconds, so you never miss a move in fast-changing markets.",
    icon: <path d="M13 2 4.5 13.5h6L9.5 22 18 10.5h-6L13 2z" />,
  },
  {
    title: "Bank-grade security",
    description:
      "Cold storage, multi-signature wallets, and continuous audits keep your assets protected around the clock.",
    icon: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9.5 12l2 2 3.5-4" />,
  },
  {
    title: "Deep liquidity",
    description:
      "Tight spreads across 180+ markets thanks to a network of institutional liquidity providers.",
    icon: <path d="M12 3c3.5 4.4 5.5 7.6 5.5 10.4a5.5 5.5 0 1 1-11 0C6.5 10.6 8.5 7.4 12 3z" />,
  },
  {
    title: "Transparent pricing",
    description:
      "No hidden fees. See exactly what you pay before every trade, with volume-based discounts as you grow.",
    icon: <path d="M4 20V10m5.5 10V4m5.5 16v-8m5 8V7" />,
  },
];

export default function HomeFeatures() {
  return (
    <LazyMotion features={domAnimation} strict>
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-cyan">
            Why novaFi
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Built for serious traders
          </h2>
          <p className="mt-4 text-nova-muted">
            Everything you need to move fast, stay informed, and trade with
            confidence &mdash; all in one platform.
          </p>
        </m.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <m.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_OUT }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-colors hover:border-nova-emerald/30 hover:bg-white/[0.07]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-nova opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-nova-emerald/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />

              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-nova-emerald/15 to-nova-cyan/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-nova-emerald transition-colors group-hover:text-nova-cyan"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold text-nova-text">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-nova-muted">
                {feature.description}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
    </LazyMotion>
  );
}
