import { CRYPTO_LOGOS } from "../../assets/crypto-icons";

export type Market = {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  
  volume24h: string;
  
  volumeUsd: number;
};

export const MARKETS: Market[] = [
  { symbol: "", name: "Bitcoin", icon: CRYPTO_LOGOS.BTCB, price: 67420.15, change24h: 2.34, volume24h: "$2.1B", volumeUsd: 2_100_000_000 },
  { symbol: "", name: "Ethereum", icon: CRYPTO_LOGOS.ETH, price: 3512.8, change24h: 1.12, volume24h: "$1.4B", volumeUsd: 1_400_000_000 },
  { symbol: "", name: "BNB", icon: CRYPTO_LOGOS.BNB, price: 587.34, change24h: -0.62, volume24h: "$412M", volumeUsd: 412_000_000 },
  { symbol: "", name: "Tether", icon: CRYPTO_LOGOS.USDT, price: 1.0, change24h: 0.02, volume24h: "$3.8B", volumeUsd: 3_800_000_000 },
  { symbol: "", name: "PancakeSwap", icon: CRYPTO_LOGOS.CAKE, price: 2.31, change24h: 3.08, volume24h: "$76M", volumeUsd: 76_000_000 },
  { symbol: "", name: "Binance USD", icon: CRYPTO_LOGOS.BUSD, price: 1.0, change24h: 0.01, volume24h: "$54M", volumeUsd: 54_000_000 },
];

export const TOTAL_VOLUME_USD: number = MARKETS.reduce(
  (sum, m) => sum + m.volumeUsd,
  0
);

export function formatUsdCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}
