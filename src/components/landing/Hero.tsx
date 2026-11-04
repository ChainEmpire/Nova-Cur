import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp } from "../../lib/landing/motion";
import CryptoMarquee from "./CryptoMarquee";
import DashboardPreview from "./DashboardPreview";
import HeroStats from "./HeroStats";
import { CRYPTO_LOGOS } from "../../assets/crypto-icons";
import { SolanaIcon, UniswapIcon } from "./crypto-marquee-icons";

const MotionLink = (motion as any).create ? (motion as any).create(Link) : (Link as any);

const TRUST_ITEMS = [
  {
    label: "Independently audited",
    icon: (
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9.5 12l2 2 3.5-4" />
    ),
  },
  {
    label: "Non-custodial by design",
    icon: <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9zm6 3v3" />,
  },
  {
    label: "99.99% uptime",
    icon: <path d="M3 13h4l2.5-6 4 12 2.5-6H21" />,
  },
];

export default function Hero() {
  return (
    <div>


      <section className="relative -mt-[69px] overflow-hidden px-6 pt-[calc(5rem+69px)] pb-24 md:pt-[calc(7rem+69px)] md:pb-32">


        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[10%] -z-10 h-[70rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(16,185,129,0.35), rgba(6,182,212,0.28), rgba(59,130,246,0.22), rgba(139,92,246,0.28), rgba(16,185,129,0.35))",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(closest-side, rgba(16,185,129,0.22), rgba(16,185,129,0.12) 45%, transparent 75%)",
          }}
          animate={{
            x: ["-50%", "-46%", "-54%", "-50%"],
            y: [0, 24, -12, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-10 right-[10%] -z-10 h-72 w-72 sm:h-96 sm:w-96"
          style={{
            background:
              "radial-gradient(closest-side, rgba(139,92,246,0.22), rgba(139,92,246,0.12) 45%, transparent 75%)",
          }}
          animate={{ x: [0, -20, 15, 0], y: [0, 20, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-[5%] -z-10 h-64 w-64 sm:h-80 sm:w-80"
          style={{
            background:
              "radial-gradient(closest-side, rgba(6,182,212,0.17), rgba(6,182,212,0.09) 45%, transparent 75%)",
          }}
          animate={{ x: [0, 20, -15, 0], y: [0, -15, 10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
        />

        
        <motion.img
          src={CRYPTO_LOGOS.BTCB}
          alt=""
          aria-hidden
          width={40}
          height={40}
          className="pointer-events-none absolute left-[8%] top-36 hidden h-10 w-10 opacity-30 lg:block"
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={CRYPTO_LOGOS.ETH}
          alt=""
          aria-hidden
          width={36}
          height={36}
          className="pointer-events-none absolute right-[10%] top-52 hidden h-9 w-9 opacity-30 lg:block"
          animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-[16%] top-[26rem] hidden opacity-25 lg:block"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <SolanaIcon className="h-8 w-8" />
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute right-[18%] top-[24rem] hidden opacity-25 lg:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <UniswapIcon className="h-8 w-8" />
        </motion.div>

        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tighter md:text-7xl"
          >
            Trade markets with{" "}
            <span className="text-gradient-nova">confidence and speed</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.1}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-nova-muted"
          >
            novaFi gives traders institutional-grade infrastructure, real-time
            data, and a clean interface &mdash; so you can focus on strategy,
            not friction.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.15}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <MotionLink
              href="/login"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                }
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-nova-animated px-8 py-3.5 text-sm font-semibold text-nova-bg shadow-lg shadow-nova-emerald/25 transition-shadow hover:shadow-xl hover:shadow-nova-emerald/35"
            >
              Get started
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </MotionLink>
            <MotionLink
              href="/about"
              whileHover={{ scale: 1.04, borderColor: "rgba(6,182,212,0.6)" }}
              whileTap={{ scale: 0.98 }}
              className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-nova-text backdrop-blur-md"
            >
              Learn More
            </MotionLink>
          </motion.div>

          
          <motion.ul
            initial="hidden"
            animate="show"
            variants={fadeUp}
            custom={0.2}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-xs font-medium text-nova-muted"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-nova-emerald"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon}
                </svg>
                {item.label}
              </li>
            ))}
          </motion.ul>

          <CryptoMarquee delay={0.25} />

          <DashboardPreview />

          <HeroStats />
        </div>
      </section>
    </div>
  );
}
