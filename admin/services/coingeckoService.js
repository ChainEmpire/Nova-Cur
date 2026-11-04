const { requestExternal } = require('./httpClient');

const PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
];

let priceCache = { prices: {}, fetchedAt: 0 };

const DEFAULT_PRICES = {
  BNB: 600,
  BUSD: 1,
  USDT: 1,
  USDC: 1,
  ETH: 3500,
  BTCB: 65000,
  CAKE: 2.5,
};

async function fetchTokenPricesUsd() {
  const now = Date.now();
  if (now - priceCache.fetchedAt < 60_000 && Object.keys(priceCache.prices).length) {
    return priceCache.prices;
  }

  const ids = [
    'binancecoin',
    'binance-usd',
    'tether',
    'usd-coin',
    'ethereum',
    'bitcoin',
    'pancakeswap-token',
  ].join(',');

  const result = await requestExternal(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
  );

  if (result.ok && result.data) {
    const data = result.data;
    const prices = {
      BNB: data.binancecoin?.usd ?? DEFAULT_PRICES.BNB,
      BUSD: data['binance-usd']?.usd ?? DEFAULT_PRICES.BUSD,
      USDT: data.tether?.usd ?? DEFAULT_PRICES.USDT,
      USDC: data['usd-coin']?.usd ?? DEFAULT_PRICES.USDC,
      ETH: data.ethereum?.usd ?? DEFAULT_PRICES.ETH,
      BTCB: data.bitcoin?.usd ?? DEFAULT_PRICES.BTCB,
      CAKE: data.pancakeswap-token?.usd ?? DEFAULT_PRICES.CAKE,
    };
    priceCache = { prices, fetchedAt: now };
    return prices;
  }

  return Object.keys(priceCache.prices).length ? priceCache.prices : DEFAULT_PRICES;
}

module.exports = {
  PAIR_ABI,
  fetchTokenPricesUsd,
};
