const { WBNB } = require('./contracts');

const TOKENS = [
  { id: 'bnb', symbol: 'BNB', name: 'BNB', address: WBNB, decimals: 18, coingeckoId: 'binancecoin' },
  { id: 'busd', symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18, coingeckoId: 'binance-usd' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, coingeckoId: 'tether' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, coingeckoId: 'usd-coin' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum (BEP20)', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', decimals: 18, coingeckoId: 'ethereum' },
  { id: 'btcb', symbol: 'BTCB', name: 'Bitcoin BEP20', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', decimals: 18, coingeckoId: 'bitcoin' },
  { id: 'cake', symbol: 'CAKE', name: 'PancakeSwap', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18, coingeckoId: 'pancakeswap-token' },
];

const TOKEN_BY_ADDRESS = Object.fromEntries(
  TOKENS.filter((token) => token.address).map((token) => [token.address.toLowerCase(), token])
);

const TOKEN_BY_SYMBOL = Object.fromEntries(TOKENS.map((token) => [token.symbol, token]));

module.exports = {
  TOKENS,
  TOKEN_BY_ADDRESS,
  TOKEN_BY_SYMBOL,
};
