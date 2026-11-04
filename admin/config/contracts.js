const PANCAKE_ROUTER_V2 = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const BSC_CHAIN_ID = 56;

const SUPPORTED_CHAINS = [
  { id: BSC_CHAIN_ID, name: 'BNB Smart Chain', symbol: 'BSC', status: 'active' },
  { id: 1, name: 'Ethereum', symbol: 'ETH', status: 'active' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', status: 'active' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB', status: 'active' },
  { id: 10, name: 'Optimism', symbol: 'OP', status: 'planned' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', status: 'planned' },
  { id: 8453, name: 'Base', symbol: 'BASE', status: 'planned' },
];

const DEFAULT_CONTRACTS = [
  {
    address: PANCAKE_ROUTER_V2,
    name: 'PancakeSwap Router V2',
    type: 'router',
    chainId: BSC_CHAIN_ID,
    verified: true,
    auditStatus: 'community-verified',
    status: 'approved',
    lastReviewedAt: new Date().toISOString(),
    reviewedBy: 'system',
    notes: 'Primary swap router for BSC trading flows.',
  },
  {
    address: WBNB,
    name: 'Wrapped BNB',
    type: 'token',
    chainId: BSC_CHAIN_ID,
    verified: true,
    auditStatus: 'verified',
    status: 'approved',
    lastReviewedAt: new Date().toISOString(),
    reviewedBy: 'system',
    notes: 'Native wrapped asset for BSC liquidity pairs.',
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    name: 'Tether USD (BEP20)',
    type: 'token',
    chainId: BSC_CHAIN_ID,
    verified: true,
    auditStatus: 'verified',
    status: 'approved',
    lastReviewedAt: new Date().toISOString(),
    reviewedBy: 'system',
    notes: 'Stablecoin used in major trading pairs.',
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    name: 'USD Coin (BEP20)',
    type: 'token',
    chainId: BSC_CHAIN_ID,
    verified: true,
    auditStatus: 'verified',
    status: 'approved',
    lastReviewedAt: new Date().toISOString(),
    reviewedBy: 'system',
    notes: 'Stablecoin used in major trading pairs.',
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Unknown Meme Router',
    type: 'router',
    chainId: BSC_CHAIN_ID,
    verified: false,
    auditStatus: 'pending',
    status: 'pending_review',
    lastReviewedAt: null,
    reviewedBy: null,
    notes: 'Submitted for review — unverified router contract.',
  },
];

module.exports = {
  PANCAKE_ROUTER_V2,
  WBNB,
  BSC_CHAIN_ID,
  SUPPORTED_CHAINS,
  DEFAULT_CONTRACTS,
};
