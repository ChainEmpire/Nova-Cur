import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";

const FAQS = [
  {
    question: "What is novaFi?",
    answer:
      "novaFi is a decentralized trading platform that unifies spot and derivatives markets in one clean interface, backed by institutional-grade infrastructure and real-time market data.",
  },
  {
    question: "Is novaFi non-custodial?",
    answer:
      "Yes. You keep control of your assets at all times. Funds held on-platform for active trading are protected by cold storage, multi-signature wallets, and continuous independent audits.",
  },
  {
    question: "Which assets and networks are supported?",
    answer:
      "novaFi supports 180+ markets across the leading chains and protocols — including Bitcoin, Ethereum, Solana, BNB Chain, and more — with new assets added every quarter.",
  },
  {
    question: "What are the trading fees?",
    answer:
      "Pricing is fully transparent: you see exactly what you pay before every trade, with no hidden fees and volume-based discounts that grow with you.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create your account in minutes, connect your wallet or make a deposit, and get instant access to every market on novaFi — no credit card required.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nova-cyan">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-nova-muted">
            Everything you need to know before you start trading.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
          className="mt-12 flex flex-col gap-3"
        >
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className={`overflow-hidden rounded-2xl border backdrop-blur-md transition-colors ${
                  isOpen
                    ? "border-nova-emerald/30 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold text-nova-text sm:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-colors ${
                      isOpen
                        ? "border-nova-emerald/40 text-nova-emerald"
                        : "border-white/15 text-nova-muted"
                    }`}
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-nova-muted">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
    </>
  );
}
