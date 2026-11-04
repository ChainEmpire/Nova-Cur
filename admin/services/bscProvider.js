const { providers } = require('ethers');
const { BSC_RPC_URL, RPC_TIMEOUT_MS } = require('../config/rpc');

let provider = null;

function getBscProvider() {
  if (!provider) {
    provider = new providers.JsonRpcProvider({
      url: BSC_RPC_URL,
      timeout: RPC_TIMEOUT_MS,
    });
  }
  return provider;
}

module.exports = {
  getBscProvider,
};
