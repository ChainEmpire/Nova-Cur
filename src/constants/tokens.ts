export interface Token {
  id: string;
  symbol: string;
  name: string;
  logoUrl: string;
  address?: string;
  decimals: number;
  color: string;
  coingeckoId: string;
}

export const TOKENS: Token[] = [
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB",
    logoUrl: "https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    decimals: 18,
    color: "#f59e0b",
    coingeckoId: "binancecoin",
  },
  {
    id: "busd",
    symbol: "BUSD",
    name: "Binance USD",
    logoUrl: "https://coin-images.coingecko.com/coins/images/9576/small/BUSD.png",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    decimals: 18,
    color: "#f0b90b",
    coingeckoId: "binance-usd",
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether USD",
    logoUrl: "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    color: "#26a17b",
    coingeckoId: "tether",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    logoUrl: "https://coin-images.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    decimals: 18,
    color: "#2775ca",
    coingeckoId: "usd-coin",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum (BEP20)",
    logoUrl: "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    decimals: 18,
    color: "#627eea",
    coingeckoId: "ethereum",
  },
  {
    id: "btcb",
    symbol: "BTCB",
    name: "Bitcoin BEP20",
    logoUrl: "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    decimals: 18,
    color: "#f7931a",
    coingeckoId: "bitcoin",
  },
  {
    id: "cake",
    symbol: "CAKE",
    name: "PancakeSwap",
    logoUrl: "https://coin-images.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    decimals: 18,
    color: "#1fc7d4",
    coingeckoId: "pancakeswap-token",
  },
  {
    id: "link",
    symbol: "LINK",
    name: "Chainlink",
    logoUrl: "https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    decimals: 18,
    color: "#2a5ada",
    coingeckoId: "chainlink",
  },
];
