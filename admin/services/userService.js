const auth = require('../auth-helper');
const pgClient = require('./pgClient');

const MOCK_USERS = [
  {
    id: 1,
    email: auth.DEMO_ACCOUNT.email,
    username: auth.DEMO_ACCOUNT.username,
    status: 'active',
    walletAddress: null,
    lastLoginAt: new Date().toISOString(),
    sessionValid: true,
    riskLevel: 'low',
    source: 'pg+demo',
  },
  {
    id: 2,
    email: 'alice@novafi.app',
    username: 'alice',
    status: 'active',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    sessionValid: true,
    riskLevel: 'low',
    source: 'mock',
  },
  {
    id: 3,
    email: 'bob@novafi.app',
    username: 'bob',
    status: 'idle',
    walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    sessionValid: false,
    riskLevel: 'medium',
    source: 'mock',
  },
  {
    id: 4,
    email: 'carol@novafi.app',
    username: 'carol',
    status: 'flagged',
    walletAddress: '0xdD2FD4581271e230360230F9337F2C9C1199',
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    sessionValid: false,
    riskLevel: 'high',
    source: 'mock',
  },
];

const userStatuses = new Map(MOCK_USERS.map((user) => [user.id, user.status]));
let pgEnrichedAt = 0;
let pgTransactionCount = 0;

async function enrichFromPgApi() {
  const now = Date.now();
  if (now - pgEnrichedAt < 60_000) {
    return pgTransactionCount;
  }

  const result = await pgClient.getDemoTransactions();
  pgEnrichedAt = now;
  pgTransactionCount = result.ok ? result.transactions.length : 0;
  return pgTransactionCount;
}

function getUsers() {
  return MOCK_USERS.map((user) => ({
    ...user,
    status: userStatuses.get(user.id) || user.status,
    transactionCount: user.id === 1 ? pgTransactionCount : undefined,
  }));
}

async function getUsersWithPgData() {
  await enrichFromPgApi();
  return getUsers();
}

function getUserById(id) {
  return getUsers().find((user) => user.id === Number(id)) || null;
}

function updateUserStatus(id, status) {
  const user = getUserById(id);
  if (!user) {
    return { ok: false, message: 'User not found.' };
  }

  if (!['active', 'idle', 'flagged', 'suspended'].includes(status)) {
    return { ok: false, message: 'Invalid status.' };
  }

  userStatuses.set(Number(id), status);
  return { ok: true, user: { ...user, status } };
}

async function getUserActivity(id) {
  const user = getUserById(id);
  if (!user) {
    return { ok: false, message: 'User not found.' };
  }

  let transactions = [];
  if (user.email === auth.DEMO_ACCOUNT.email) {
    const result = await pgClient.getDemoTransactions();
    if (result.ok) {
      transactions = result.transactions;
    }
  }

  if (!transactions.length) {
    transactions = [
      {
        id: 1,
        type: 'swap',
        coin_symbol: 'BNB',
        amount_usd: 420,
        status: 'confirmed',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 2,
        type: 'buy',
        coin_symbol: 'USDT',
        amount_usd: 1500,
        status: 'confirmed',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];
  }

  return {
    ok: true,
    user,
    activity: {
      sessions: [
        { type: 'login', at: user.lastLoginAt, success: user.sessionValid },
        {
          type: 'wallet_connect',
          at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          success: true,
        },
      ],
      transactions,
      source: transactions.length && user.email === auth.DEMO_ACCOUNT.email ? 'pg-api' : 'fallback',
    },
  };
}

async function getWalletActivity(address) {
  const normalized = String(address || '').toLowerCase();
  const user = getUsers().find(
    (item) => item.walletAddress && item.walletAddress.toLowerCase() === normalized
  );

  return {
    ok: true,
    wallet: address,
    linkedUser: user || null,
    events: [
      {
        type: 'swap',
        pair: 'BNB/USDT',
        amountUsd: 890,
        at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        type: 'add_liquidity',
        pair: 'BNB/ETH',
        amountUsd: 2400,
        at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
    ],
  };
}

module.exports = {
  getUsers,
  getUsersWithPgData,
  getUserById,
  updateUserStatus,
  getUserActivity,
  getWalletActivity,
};
