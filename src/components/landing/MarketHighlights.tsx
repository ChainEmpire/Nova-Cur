import { useEffect, useRef } from "react";
import { LazyMotion, domAnimation, m, animate, useInView } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";
import { MARKETS, TOTAL_VOLUME_USD, formatUsdCompact, type Market } from "../../lib/landing/markets";
import Sparkline from "./Sparkline";

const topGainer: Market = MARKETS.reduce((best, mkt) =>
  mkt.change24h > best.change24h ? mkt : best
);
const topVolume: Market = MARKETS.reduce((best, mkt) =>
  mkt.volumeUsd > best.volumeUsd ? mkt : best
);


function AnimatedVolume({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = formatUsdCompact(v);
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="text-gradient-nova">
      $0
    </span>
  );
}

export default function MarketHighlights() {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="px-6 pt-2 pb-4">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-nova-muted">
              Top gainer 24h
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={topGainer.icon}
                  alt={topGainer.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{topGainer.name}</p>
                  <p className="text-xs font-medium text-nova-emerald">
                    +{topGainer.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              <Sparkline seed={topGainer.name} positive className="h-9 w-20" />
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-nova-muted">
              Highest volume
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={topVolume.icon}
                  alt={topVolume.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{topVolume.name}</p>
                  <p className="text-xs text-nova-muted">{topVolume.volume24h} traded</p>
                </div>
              </div>
              <Sparkline
                seed={topVolume.name}
                positive={topVolume.change24h >= 0}
                className="h-9 w-20"
              />
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full bg-nova-emerald/10 blur-2xl"
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-nova-muted">
              24h market volume
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight">
              <AnimatedVolume value={TOTAL_VOLUME_USD} />
            </p>
            <p className="mt-1 text-xs text-nova-muted">
              Across {MARKETS.length} listed markets
            </p>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
