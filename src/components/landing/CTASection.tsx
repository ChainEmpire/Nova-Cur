import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";

const MotionLink = (m as any).create ? (m as any).create(Link) : (Link as any);

interface CTASectionProps {
  heading: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
}

export default function CTASection({
  heading,
  description,
  primaryLabel,
  primaryHref,
}: CTASectionProps) {
  const isInternal = primaryHref.startsWith("/");

  return (
    <LazyMotion features={domAnimation} strict>
    <section className="px-6 py-20">
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-14 text-center backdrop-blur-md sm:px-8 sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(480px circle at 20% 0%, rgba(16,185,129,0.16), transparent 60%), radial-gradient(480px circle at 80% 100%, rgba(139,92,246,0.16), transparent 60%)",
          }}
        />

        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-nova-muted">{description}</p>
        {isInternal ? (
          <MotionLink
            href={primaryHref}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
              }
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-block rounded-full bg-gradient-nova-animated px-8 py-3.5 text-sm font-semibold text-nova-bg shadow-lg shadow-nova-emerald/25 transition-shadow hover:shadow-xl hover:shadow-nova-emerald/35"
          >
            {primaryLabel}
          </MotionLink>
        ) : (
          <m.a
            href={primaryHref}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-block rounded-full bg-gradient-nova-animated px-8 py-3.5 text-sm font-semibold text-nova-bg shadow-lg shadow-nova-emerald/25 transition-shadow hover:shadow-xl hover:shadow-nova-emerald/35"
          >
            {primaryLabel}
          </m.a>
        )}
        <p className="mt-4 text-xs text-nova-muted">
          No credit card required &mdash; start in minutes.
        </p>
      </m.div>
    </section>
    </LazyMotion>
  );
}
