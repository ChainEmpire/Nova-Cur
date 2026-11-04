import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { EASE_OUT } from "../../lib/landing/motion";
import { CRYPTO_LOGOS } from "../../assets/crypto-icons";
import {
  SolanaIcon,
  ChainlinkIcon,
  AvalancheIcon,
  PolygonIcon,
  ArbitrumIcon,
  OptimismIcon,
  UniswapIcon,
  SuiIcon,
  AptosIcon,
  NearIcon,
  CosmosIcon,
} from "./crypto-marquee-icons";



type LogoItem = {
  name: string;
  src?: string;
  Icon?: (props: { className?: string }) => ReactElement;
};

const LOGOS: LogoItem[] = [
  { name: "Bitcoin", src: CRYPTO_LOGOS.BTCB },
  { name: "Ethereum", src: CRYPTO_LOGOS.ETH },
  { name: "Solana", Icon: SolanaIcon },
  { name: "Chainlink", Icon: ChainlinkIcon },
  { name: "Avalanche", Icon: AvalancheIcon },
  { name: "Polygon", Icon: PolygonIcon },
  { name: "Arbitrum", Icon: ArbitrumIcon },
  { name: "Optimism", Icon: OptimismIcon },
  { name: "Uniswap", Icon: UniswapIcon },
  { name: "Sui", Icon: SuiIcon },
  { name: "Aptos", Icon: AptosIcon },
  { name: "BNB Chain", src: CRYPTO_LOGOS.BNB },
  { name: "Near Protocol", Icon: NearIcon },
  { name: "Cosmos", Icon: CosmosIcon },
];

const MARQUEE_LOGOS = [...LOGOS, ...LOGOS];

interface CryptoMarqueeProps {
  delay?: number;
}

export default function CryptoMarquee({ delay = 0 }: CryptoMarqueeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
      className="mt-12 w-full"
    >
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-nova-muted">
        Multi-chain support
      </p>

      <div className="group relative overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-nova-bg to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-nova-bg to-transparent sm:w-28" />

        <div className="flex w-max animate-[marquee_18s_linear_infinite_reverse] gap-8 group-hover:[animation-play-state:paused] sm:gap-12">
          {MARQUEE_LOGOS.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              title={logo.name}
              className="flex h-9 w-9 shrink-0 items-center justify-center opacity-50 grayscale transition-all duration-300 hover:scale-125 hover:opacity-100 hover:grayscale-0 hover:drop-shadow-[0_0_14px_rgba(6,182,212,0.5)] sm:h-10 sm:w-10"
            >
              <div
                className="flex h-full w-full animate-[float_6s_ease-in-out_infinite] items-center justify-center"
                style={{ animationDelay: `${(i % LOGOS.length) * 0.25}s` }}
              >
                {logo.src ? (
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-full w-full object-contain"
                  />
                ) : logo.Icon ? (
                  <logo.Icon className="h-full w-full" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
