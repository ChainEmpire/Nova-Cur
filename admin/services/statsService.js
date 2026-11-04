const userService = require('./userService');
const tradingService = require('./tradingService');
const liquidityService = require('./liquidityService');
const activityService = require('./activityService');
const chainIndexer = require('./chainIndexer');
const contractService = require('./contractService');

async function getOverviewStats() {
  const [trading, liquidity, chainHealth, indexer] = await Promise.all([
    Promise.resolve(tradingService.getTradingSummary()),
    liquidityService.getLiquiditySummary(),
    chainIndexer.getChainStatus(),
    chainIndexer.getIndexerHealth(),
  ]);

  const users = userService.getUsers();
  const alerts = activityService.getAlerts();
  const contracts = contractService.getContracts();

  const activeUsers = users.filter((user) => user.status === 'active').length;
  const pendingContracts = contracts.filter((item) => item.status === 'pending_review').length;

  return {
    activeUsers24h: activeUsers,
    totalUsers: users.length,
    swapVolume24hUsd: trading.volume24hUsd,
    totalTrades24h: trading.totalTrades,
    tvlUsd: liquidity.totalValueLocked,
    poolCount: liquidity.pools,
    failedTxRate: trading.failedTxRate,
    openAlerts: alerts.length,
    pendingContractReviews: pendingContracts,
    chainHealth,
    indexer,
  };
}

function getTradingStats(period = '24h') {
  const trading = tradingService.getTradingSummary();
  const trades = tradingService.getTrades();

  return {
    period,
    totalTrades: trading.totalTrades,
    volumeUsd: trading.volume24hUsd,
    activePairs: trading.activePairs,
    failedTxRate: trading.failedTxRate,
    topPairs: tradingService.getPairs().slice(0, 5),
    recentTrades: trades.slice(0, 10),
  };
}

async function getLiquidityStats(period = '24h') {
  const summary = await liquidityService.getLiquiditySummary();
  const topPools = (await liquidityService.getPools()).slice(0, 5);

  return {
    period,
    pools: summary.pools,
    tvlUsd: summary.totalValueLocked,
    avgApy: summary.avgApy,
    riskyPools: summary.riskyPools,
    eventsLast24h: summary.eventsLast24h,
    topPools,
  };
}

function getUserStats(period = '24h') {
  const users = userService.getUsers();

  return {
    period,
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === 'active').length,
    flaggedUsers: users.filter((user) => user.status === 'flagged').length,
    suspendedUsers: users.filter((user) => user.status === 'suspended').length,
    newWalletConnections: users.filter((user) => user.walletAddress).length,
    retention7d: 62.4,
  };
}

async function exportSnapshot() {
  return {
    exportedAt: new Date().toISOString(),
    overview: await getOverviewStats(),
    trading: getTradingStats(),
    liquidity: await getLiquidityStats(),
    users: getUserStats(),
  };
}

module.exports = {
  getOverviewStats,
  getTradingStats,
  getLiquidityStats,
  getUserStats,
  exportSnapshot,
};
