import { LazyMotion, domAnimation, m } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";

const SECURITY_ITEMS = [
  {
    title: "Cold storage by default",
    description:
      "The vast majority of assets are held offline in geographically distributed, multi-signature cold wallets.",
    icon: (
      <>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5" />
      </>
    ),
  },
  {
    title: "Continuous audits",
    description:
      "Independent security firms audit our infrastructure on an ongoing basis, backed by a public bug-bounty program.",
    icon: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M15.5 15.5 20 20M8.5 11l1.8 1.8 3.2-3.6" />
      </>
    ),
  },
  {
    title: "Real-time risk monitoring",
    description:
      "Automated anomaly detection watches every order, withdrawal, and login around the clock, every day of the year.",
    icon: (
      <>
        <path d="M3 13h4l2.5-6 4 12 2.5-6H21" />
        <circle cx="12" cy="13" r="9.5" strokeOpacity="0.35" />
      </>
    ),
  },
];

function AnimatedShield() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      <m.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-nova-emerald/30"
        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
      <m.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-nova-cyan/30"
        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
        transition={{ duration: 2.4, delay: 1.2, repeat: Infinity, ease: "easeOut" }}
      />
      <m.div
        className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-9 w-9 text-nova-emerald"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
          <path d="M9.5 12l2 2 3.5-4" />
        </svg>
      </m.div>
    </div>
  );
}

export default function SecuritySection() {
  return (
    <LazyMotion features={domAnimation} strict>
    <section className="relative overflow-hidden px-6 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-nova-emerald/[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-6xl">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mx-auto max-w-2xl text-center"
        >
          <AnimatedShield />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-nova-emerald">
            Security first
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Your assets, protected at every layer
          </h2>
          <p className="mt-4 text-nova-muted">
            Institutional-grade custody and monitoring, so you can trade
            without worrying about what happens behind the scenes.
          </p>
        </m.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {SECURITY_ITEMS.map((item, i) => (
            <m.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: EASE_OUT }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-colors hover:border-nova-emerald/30 hover:bg-white/[0.07]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-nova-cyan/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-nova-emerald/15 to-nova-cyan/10 transition-transform duration-300 group-hover:scale-110">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-nova-emerald"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-nova-muted">
                {item.description}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
    </LazyMotion>
  );
}
