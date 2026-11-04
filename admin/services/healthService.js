const { getPgBaseUrl, requestPg, requestExternal } = require('./httpClient');
const pgClient = require('./pgClient');
const chainIndexer = require('./chainIndexer');

async function checkPgApi() {
  const result = await pgClient.pingApi();
  return {
    service: 'pg-api',
    url: getPgBaseUrl(),
    status: result.ok ? 'up' : 'down',
    httpStatus: result.status,
  };
}

async function checkCoinGecko() {
  const result = await requestExternal(
    'https://api.coingecko.com/api/v3/ping'
  );
  return {
    service: 'coingecko',
    status: result.ok ? 'up' : 'down',
    httpStatus: result.status,
  };
}

async function checkBscRpc() {
  try {
    const indexer = await chainIndexer.getIndexerHealth();
    return {
      service: 'bsc-rpc',
      status: indexer.status === 'offline' ? 'down' : 'up',
      lastBlock: indexer.lastSyncedBlock,
      latencyMs: indexer.rpcLatencyMs,
    };
  } catch (error) {
    return {
      service: 'bsc-rpc',
      status: 'down',
      error: error.message,
    };
  }
}

async function getPlatformHealth() {
  const [pgApi, coingecko, bscRpc] = await Promise.all([
    checkPgApi(),
    checkCoinGecko(),
    checkBscRpc(),
  ]);

  const services = [pgApi, coingecko, bscRpc];
  const downCount = services.filter((item) => item.status === 'down').length;

  return {
    status: downCount === 0 ? 'healthy' : downCount === services.length ? 'offline' : 'degraded',
    checkedAt: new Date().toISOString(),
    services,
  };
}

module.exports = {
  getPlatformHealth,
  checkPgApi,
  checkCoinGecko,
  checkBscRpc,
};
