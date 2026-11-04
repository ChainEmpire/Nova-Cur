const { Contract } = require('ethers');
const { SUPPORTED_CHAINS } = require('../config/contracts');
const { getBscProvider } = require('./bscProvider');
const { BSC_RPC_URL } = require('../config/rpc');

let cachedHealth = null;
let healthFetchedAt = 0;

async function measureRpcLatency() {
  const start = Date.now();
  const provider = getBscProvider();
  await provider.getBlockNumber();
  return Date.now() - start;
}

async function getChainStatus() {
  const results = await Promise.all(
    SUPPORTED_CHAINS.map(async (chain) => {
      if (chain.id !== 56 || chain.status !== 'active') {
        return {
          ...chain,
          rpcLatencyMs: null,
          blockLag: null,
          routerAvailable: chain.status === 'active',
        };
      }

      try {
        const latency = await measureRpcLatency();
        return {
          ...chain,
          rpcLatencyMs: latency,
          blockLag: 0,
          routerAvailable: true,
          rpcUrl: BSC_RPC_URL,
        };
      } catch {
        return {
          ...chain,
          rpcLatencyMs: null,
          blockLag: null,
          routerAvailable: false,
        };
      }
    })
  );

  return results;
}

function getRecentOnChainEvents(limit = 20) {
  const now = Date.now();
  const pairs = ['BNB/USDT', 'BNB/BUSD', 'BNB/ETH', 'BNB/CAKE', 'USDT/BUSD'];
  const types = ['swap', 'add_liquidity', 'remove_liquidity'];

  return Array.from({ length: limit }, (_, index) => {
    const type = types[index % types.length];
    return {
      id: `evt-${index + 1}`,
      type,
      chainId: 56,
      pair: pairs[index % pairs.length],
      txHash: `0x${(index + 1).toString(16).padStart(64, '0')}`,
      wallet: `0x${(1000 + index).toString(16).padStart(40, '0')}`,
      amountUsd: Math.round(250 + Math.random() * 9800),
      at: new Date(now - index * 1000 * 60 * 4).toISOString(),
      status: index % 11 === 0 ? 'failed' : 'confirmed',
      source: 'synthetic',
    };
  });
}

async function getIndexerHealth() {
  const now = Date.now();
  if (cachedHealth && now - healthFetchedAt < 30_000) {
    return cachedHealth;
  }

  try {
    const provider = getBscProvider();
    const blockNumber = await provider.getBlockNumber();
    const latency = await measureRpcLatency();

    cachedHealth = {
      status: latency < 5000 ? 'healthy' : 'degraded',
      lastSyncedBlock: blockNumber,
      lagBlocks: 0,
      indexedChains: SUPPORTED_CHAINS.filter((chain) => chain.status === 'active').map(
        (chain) => chain.id
      ),
      eventsLastHour: null,
      rpcLatencyMs: latency,
      note: 'Live BSC RPC — swap events use synthetic feed until subgraph is connected.',
    };
    healthFetchedAt = now;
    return cachedHealth;
  } catch (error) {
    return {
      status: 'offline',
      lastSyncedBlock: null,
      lagBlocks: null,
      indexedChains: [],
      eventsLastHour: 0,
      note: error.message || 'Unable to reach BSC RPC.',
    };
  }
}

module.exports = {
  getChainStatus,
  getRecentOnChainEvents,
  getIndexerHealth,
};
