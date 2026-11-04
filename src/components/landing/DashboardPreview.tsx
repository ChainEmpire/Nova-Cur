import { motion, useMotionValue, useSpring } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";
import { CRYPTO_LOGOS } from "../../assets/crypto-icons";

const PREVIEW_MARKETS = [
  { name: "Bitcoin", icon: CRYPTO_LOGOS.BTCB, price: "$67,420.15", change: "+2.34%", up: true },
  { name: "Ethereum", icon: CRYPTO_LOGOS.ETH, price: "$3,512.80", change: "+1.12%", up: true },
  { name: "BNB", icon: CRYPTO_LOGOS.BNB, price: "$587.34", change: "-0.62%", up: false },
];



export default function DashboardPreview() {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 80, damping: 16 });
  const springY = useSpring(rotateY, { stiffness: 80, damping: 16 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 5);
    rotateX.set(-py * 5);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
      className="mt-14 w-full [perspective:1200px]"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{ rotateX: springX, rotateY: springY }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-nova-emerald/5 backdrop-blur-xl"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px circle at 15% 0%, rgba(16,185,129,0.10), transparent 55%), radial-gradient(600px circle at 85% 100%, rgba(139,92,246,0.10), transparent 55%)",
          }}
        />

        
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <span className="text-xs font-medium text-nova-muted">BTC / USDT</span>
          <span className="flex items-center gap-1.5 rounded-full border border-nova-emerald/30 bg-nova-emerald/10 px-2.5 py-0.5 text-[10px] font-semibold text-nova-emerald">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nova-emerald opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nova-emerald" />
            </span>
            LIVE
          </span>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-[1.6fr_1fr] md:gap-6 md:p-6">
          
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight">$67,420.15</p>
                <p className="text-xs font-medium text-nova-emerald">+2.34% today</p>
              </div>
              <div className="hidden gap-1 sm:flex">
                {["1H", "1D", "1W", "1Y"].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                      i === 1 ? "bg-white/10 text-nova-text" : "text-nova-muted"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <svg viewBox="0 0 400 140" className="mt-3 w-full" aria-hidden>
              <defs>
                <linearGradient id="hero-chart-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#10b981" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="hero-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,118 C36,112 54,88 88,92 S150,52 184,62 S250,70 284,48 S344,34 372,26 L400,20"
                fill="none"
                stroke="url(#hero-chart-stroke)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.5, ease: EASE_OUT }}
              />
              <motion.path
                d="M0,118 C36,112 54,88 88,92 S150,52 184,62 S250,70 284,48 S344,34 372,26 L400,20 L400,140 L0,140 Z"
                fill="url(#hero-chart-fill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              />
              <motion.circle
                cx="400"
                cy="20"
                r="4"
                fill="#06b6d4"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4, 1] }}
                transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
              />
            </svg>
          </div>

          
          <div className="flex flex-col gap-3">
            {PREVIEW_MARKETS.map((mkt, i) => (
              <motion.div
                key={mkt.name}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.1, ease: EASE_OUT }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img src={mkt.icon} alt="" width={28} height={28} className="h-7 w-7 rounded-full" />
                  <span className="text-sm font-medium">{mkt.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{mkt.price}</p>
                  <p
                    className={`text-xs font-medium ${
                      mkt.up ? "text-nova-emerald" : "text-rose-400"
                    }`}
                  >
                    {mkt.change}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
