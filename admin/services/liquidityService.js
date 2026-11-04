const { Contract, utils } = require('ethers');
const { POOLS } = require('../config/pools');
const { getBscProvider } = require('./bscProvider');
const { PAIR_ABI, fetchTokenPricesUsd } = require('./coingeckoService');
const chainIndexer = require('./chainIndexer');

let poolCache = { pools: [], fetchedAt: 0 };

function assessPoolRisk(reserveAUsd, reserveBUsd) {
  if (!reserveAUsd || !reserveBUsd) return 'normal';
  const ratio = reserveAUsd / reserveBUsd;
  return ratio > 3 || ratio < 0.33 ? 'high' : 'normal';
}

async function fetchLivePools() {
  const now = Date.now();
  if (poolCache.pools.length && now - poolCache.fetchedAt < 60_000) {
    return poolCache.pools;
  }

  const provider = getBscProvider();
  const prices = await fetchTokenPricesUsd();

  const pools = await Promise.all(
    POOLS.map(async (poolDef) => {
      try {
        const pair = new Contract(poolDef.pairAddress, PAIR_ABI, provider);
        const [reserves, token0] = await Promise.all([
          pair.getReserves(),
          pair.token0(),
        ]);
        const { reserve0, reserve1 } = reserves;

        const token0IsA =
          String(token0).toLowerCase() === String(poolDef.tokenA.address).toLowerCase();
        const rawA = token0IsA ? reserve0 : reserve1;
        const rawB = token0IsA ? reserve1 : reserve0;

        const reserveA = Number(utils.formatUnits(rawA, poolDef.tokenA.decimals));
        const reserveB = Number(utils.formatUnits(rawB, poolDef.tokenB.decimals));
        const priceA = prices[poolDef.tokenA.symbol] || 0;
        const priceB = prices[poolDef.tokenB.symbol] || 0;
        const reserveAUsd = reserveA * priceA;
        const reserveBUsd = reserveB * priceB;
        const tvlUsd = Math.round(reserveAUsd + reserveBUsd);
        const risk = assessPoolRisk(reserveAUsd, reserveBUsd);

        return {
          pair: poolDef.pair,
          chainId: poolDef.chainId,
          tvlUsd,
          volume24hUsd: null,
          apy: Number((4 + (tvlUsd > 1_000_000 ? 6 : 12)).toFixed(2)),
          feeTier: poolDef.feeTier,
          risk,
          contractAddress: poolDef.pairAddress,
          verified: true,
          reserveA,
          reserveB,
          source: 'on-chain',
        };
      } catch {
        return {
          pair: poolDef.pair,
          chainId: poolDef.chainId,
          tvlUsd: 0,
          volume24hUsd: null,
          apy: 0,
          feeTier: poolDef.feeTier,
          risk: 'unknown',
          contractAddress: poolDef.pairAddress,
          verified: false,
          source: 'fallback',
        };
      }
    })
  );

  poolCache = { pools, fetchedAt: now };
  return pools;
}

async function getLiquiditySummary() {
  const pools = await fetchLivePools();
  const events = chainIndexer.getRecentOnChainEvents(30);
  const lpEvents = events.filter((event) => event.type !== 'swap');
  const totalValueLocked = pools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0);
  const riskyPools = pools.filter((pool) => pool.risk === 'high').map((pool) => pool.pair);
  const imbalancedPools = pools.filter((pool) => pool.risk === 'high').length;
  const healthiestPool =
    [...pools].sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0))[0]?.pair || '—';
  const apyValues = pools.map((pool) => pool.apy).filter(Boolean);

  return {
    pools: pools.length,
    totalValueLocked,
    avgApy: apyValues.length
      ? Number((apyValues.reduce((sum, value) => sum + value, 0) / apyValues.length).toFixed(2))
      : 0,
    healthiestPool,
    riskyPools,
    eventsLast24h: lpEvents.length,
    imbalancedPools,
    source: pools.some((pool) => pool.source === 'on-chain') ? 'on-chain' : 'fallback',
  };
}

async function getPools() {
  return fetchLivePools();
}

async function getPool(pair) {
  const pools = await fetchLivePools();
  return pools.find((pool) => pool.pair === pair) || null;
}

function getLiquidityEvents(limit = 25) {
  return chainIndexer
    .getRecentOnChainEvents(limit)
    .filter((event) => event.type !== 'swap')
    .map((event) => ({
      id: event.id,
      type: event.type,
      pair: event.pair,
      wallet: event.wallet,
      amountUsd: event.amountUsd,
      txHash: event.txHash,
      at: event.at,
      status: event.status,
    }));
}

async function getRiskyPools() {
  const pools = await fetchLivePools();
  return pools.filter((pool) => pool.risk === 'high');
}

module.exports = {
  getLiquiditySummary,
  getPools,
  getPool,
  getLiquidityEvents,
  getRiskyPools,
};
