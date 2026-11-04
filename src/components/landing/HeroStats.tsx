import { useEffect, useRef } from "react";
import { motion, animate, useInView } from "framer-motion";
import { EASE_OUT, fadeUp } from "../../lib/landing/motion";

const STATS = [
  { label: "Assets listed", value: 180, suffix: "+" },
  { label: "Avg. execution", value: 40, prefix: "<", suffix: "ms" },
  { label: "Uptime", value: 99.99, decimals: 2, suffix: "%" },
  { label: "Traders served", value: 250, suffix: "K+" },
];



function StatValue({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, value, decimals, prefix, suffix]);

  return (
    <span ref={ref} className="text-gradient-nova">
      {prefix}0{suffix}
    </span>
  );
}


export default function HeroStats() {
  return (
    <motion.dl
      initial="hidden"
      animate="show"
      variants={fadeUp}
      custom={0.35}
      className="mt-12 grid w-full grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:grid-cols-4 sm:gap-8 sm:p-8"
    >
      {STATS.map((stat) => (
        <div key={stat.label}>
          <dt className="text-2xl font-bold tracking-tight md:text-3xl">
            <StatValue
              value={stat.value}
              decimals={stat.decimals}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </dt>
          <dd className="mt-1 text-xs text-nova-muted md:text-sm">
            {stat.label}
          </dd>
        </div>
      ))}
    </motion.dl>
  );
}
