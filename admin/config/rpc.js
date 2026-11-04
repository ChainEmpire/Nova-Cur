const BSC_RPC_URL =
  process.env.BSC_RPC_URL ||
  process.env.NEXT_PUBLIC_BSC_RPC ||
  'https://bsc-dataseed.binance.org/';

const RPC_TIMEOUT_MS = Number(process.env.BSC_RPC_TIMEOUT_MS || 10000);

module.exports = {
  BSC_RPC_URL,
  RPC_TIMEOUT_MS,
};
