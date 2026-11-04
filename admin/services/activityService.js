const chainIndexer = require('./chainIndexer');
const auth = require('../auth-helper');
const pgClient = require('./pgClient');

function mapPgTransaction(tx, index) {
  return {
    id: `pg-${tx.id ?? index}`,
    type: tx.type || 'swap',
    user: auth.DEMO_ACCOUNT.username,
    wallet: null,
    pair: tx.coin_symbol ? `${tx.coin_symbol}/USD` : undefined,
    amountUsd: tx.amount_usd,
    status: tx.status,
    at: tx.created_at,
    source: 'pg-api',
  };
}

async function getRecentActivity(limit = 20) {
  const chainEvents = chainIndexer.getRecentOnChainEvents(limit).map((event) => ({
    id: event.id,
    type: event.type,
    user: `${event.wallet.slice(0, 6)}...${event.wallet.slice(-4)}`,
    wallet: event.wallet,
    pair: event.pair,
    amountUsd: event.amountUsd,
    status: event.status,
    at: event.at,
    source: event.source || 'chain',
  }));

  const authEvents = [
    {
      id: 'auth-1',
      type: 'login',
      user: auth.DEMO_ACCOUNT.username,
      at: new Date().toISOString(),
      status: 'success',
      source: 'auth',
    },
    {
      id: 'auth-2',
      type: 'login',
      user: 'alice',
      at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
      status: 'success',
      source: 'auth',
    },
    {
      id: 'auth-3',
      type: 'login_failed',
      user: 'unknown',
      at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
      status: 'failed',
      source: 'auth',
    },
  ];

  let pgEvents = [];
  const pgResult = await pgClient.getDemoTransactions();
  if (pgResult.ok && pgResult.transactions.length) {
    pgEvents = pgResult.transactions.slice(0, 10).map(mapPgTransaction);
  }

  return {
    events: [...authEvents, ...pgEvents, ...chainEvents]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, limit),
    sources: {
      pgApi: pgEvents.length > 0,
      chain: chainEvents.length > 0,
    },
  };
}

function getAlerts() {
  return [
    {
      id: 'alert-1',
      severity: 'high',
      title: 'Suspicious wallet activity',
      message: 'Wallet 0x742d...0bEb executed 12 swaps in 5 minutes.',
      at: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      severity: 'medium',
      title: 'Pool imbalance',
      message: 'One or more BSC pools show reserve drift above 3:1 ratio.',
      at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'alert-3',
      severity: 'low',
      title: 'Contract pending review',
      message: 'Unknown Meme Router awaiting security review.',
      at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];
}

module.exports = {
  getRecentActivity,
  getAlerts,
};
