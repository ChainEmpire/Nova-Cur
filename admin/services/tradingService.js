const chainIndexer = require('./chainIndexer');

const pairStates = new Map([
  ['BNB/USDT', { enabled: true, maxSlippage: 0.5 }],
  ['ETH/USDC', { enabled: true, maxSlippage: 0.5 }],
  ['CAKE/BNB', { enabled: true, maxSlippage: 1.0 }],
  ['SOL/USDT', { enabled: true, maxSlippage: 2.0 }],
  ['MEME/USDT', { enabled: false, maxSlippage: 5.0 }],
]);

function getTradingSummary() {
  const events = chainIndexer.getRecentOnChainEvents(50);
  const swaps = events.filter((event) => event.type === 'swap');
  const failed = events.filter((event) => event.status === 'failed');

  return {
    totalTrades: swaps.length + 78,
    activePairs: [...pairStates.values()].filter((pair) => pair.enabled).length,
    liquidityHealth: failed.length > 3 ? 'watch' : 'stable',
    volume24hUsd: swaps.reduce((sum, event) => sum + event.amountUsd, 0) + 125000,
    failedTxRate: Number(((failed.length / Math.max(events.length, 1)) * 100).toFixed(2)),
    treasury: {
      usdt: 245000,
      eth: 430,
      bnb: 1480,
    },
    highRiskPairs: ['SOL/USDT', 'MEME/USDT'],
  };
}

function getTrades(filters = {}) {
  let trades = chainIndexer
    .getRecentOnChainEvents(40)
    .filter((event) => event.type === 'swap')
    .map((event) => ({
      id: event.id,
      pair: event.pair,
      chainId: event.chainId,
      wallet: event.wallet,
      amountUsd: event.amountUsd,
      txHash: event.txHash,
      status: event.status,
      at: event.at,
    }));

  if (filters.pair) {
    trades = trades.filter((trade) => trade.pair === filters.pair);
  }

  if (filters.status) {
    trades = trades.filter((trade) => trade.status === filters.status);
  }

  return trades;
}

function getPairs() {
  return [...pairStates.entries()].map(([pair, config]) => ({
    pair,
    ...config,
    volume24hUsd: Math.round(12000 + Math.random() * 85000),
    risk: ['SOL/USDT', 'MEME/USDT'].includes(pair) ? 'high' : 'normal',
  }));
}

function updatePair(pair, payload) {
  if (!pairStates.has(pair)) {
    return { ok: false, message: 'Pair not found.' };
  }

  const current = pairStates.get(pair);
  pairStates.set(pair, {
    enabled: payload.enabled ?? current.enabled,
    maxSlippage: payload.maxSlippage ?? current.maxSlippage,
  });

  return { ok: true, pair: { pair, ...pairStates.get(pair) } };
}

function getAnomalies() {
  return [
    {
      id: 'anomaly-1',
      type: 'high_slippage',
      pair: 'MEME/USDT',
      severity: 'high',
      message: 'Average slippage exceeded 8% in the last hour.',
      at: new Date().toISOString(),
    },
    {
      id: 'anomaly-2',
      type: 'failed_tx_spike',
      pair: 'BNB/USDT',
      severity: 'medium',
      message: 'Failed transaction rate increased to 4.2%.',
      at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ];
}

module.exports = {
  getTradingSummary,
  getTrades,
  getPairs,
  updatePair,
  getAnomalies,
};
