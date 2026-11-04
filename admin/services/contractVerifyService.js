const { requestExternal } = require('./httpClient');

const EXPLORER_APIS = {
  56: {
    name: 'BscScan',
    baseUrl: 'https://api.bscscan.com/api',
    apiKeyEnv: 'BSCSCAN_API_KEY',
  },
  1: {
    name: 'Etherscan',
    baseUrl: 'https://api.etherscan.io/api',
    apiKeyEnv: 'ETHERSCAN_API_KEY',
  },
};

function getExplorerConfig(chainId) {
  return EXPLORER_APIS[Number(chainId)] || EXPLORER_APIS[56];
}

async function fetchContractSource(address, chainId = 56) {
  const explorer = getExplorerConfig(chainId);
  const apiKey = process.env[explorer.apiKeyEnv] || 'YourApiKeyToken';
  const url = `${explorer.baseUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

  const result = await requestExternal(url);
  if (!result.ok || !result.data) {
    return {
      ok: false,
      message: result.error || 'Explorer API request failed.',
      explorer: explorer.name,
    };
  }

  const payload = result.data;
  if (payload.status !== '1' || !Array.isArray(payload.result) || !payload.result.length) {
    return {
      ok: false,
      message: payload.result || payload.message || 'Contract not verified on explorer.',
      explorer: explorer.name,
    };
  }

  const source = payload.result[0];
  const isVerified = Boolean(source.SourceCode && source.SourceCode.length > 0);

  return {
    ok: true,
    explorer: explorer.name,
    verified: isVerified,
    contractName: source.ContractName || null,
    compilerVersion: source.CompilerVersion || null,
    optimizationUsed: source.OptimizationUsed === '1',
    proxy: source.Proxy === '1',
    implementation: source.Implementation || null,
    abiAvailable: Boolean(source.ABI && source.ABI !== 'Contract source code not verified'),
  };
}

async function verifyContract(address, chainId = 56) {
  const normalized = String(address || '').toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    return { ok: false, message: 'Invalid contract address.' };
  }

  const explorerResult = await fetchContractSource(normalized, chainId);
  if (!explorerResult.ok) {
    return explorerResult;
  }

  return {
    ok: true,
    address: normalized,
    chainId: Number(chainId),
    ...explorerResult,
    auditStatus: explorerResult.verified ? 'explorer-verified' : 'unverified',
    recommendation: explorerResult.proxy
      ? 'Proxy contract detected — review implementation address before approval.'
      : explorerResult.verified
        ? 'Source verified on explorer.'
        : 'No verified source — manual security review required.',
  };
}

module.exports = {
  verifyContract,
  fetchContractSource,
};
