export const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:3001";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface AdminSession {
  token: string;
  admin: AdminUser;
}

const STORAGE_KEY = "novafi_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isAdminLoggedIn(): boolean {
  return Boolean(getAdminToken());
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.reason || "Admin request failed.");
  }

  return data as T;
}

export async function adminLogin(email: string, password: string) {
  return adminFetch<{ ok: boolean; token: string; admin: AdminUser; message?: string }>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

export async function adminLogout() {
  return adminFetch<{ ok: boolean }>("/admin/auth/logout", { method: "POST" });
}

export async function adminMe() {
  return adminFetch<{ ok: boolean; admin: AdminUser; permissions: string[] }>("/admin/auth/me");
}

export interface ChainHealth {
  id: number;
  name: string;
  symbol: string;
  status: string;
  rpcLatencyMs: number | null;
  blockLag: number | null;
  routerAvailable: boolean;
}

export interface OverviewStats {
  activeUsers24h: number;
  totalUsers: number;
  swapVolume24hUsd: number;
  totalTrades24h: number;
  tvlUsd: number;
  poolCount: number;
  failedTxRate: number;
  openAlerts: number;
  pendingContractReviews: number;
  chainHealth: ChainHealth[];
  indexer: {
    status: string;
    lastSyncedBlock: number;
    lagBlocks: number;
    indexedChains: number[];
    eventsLastHour: number;
    note: string;
  };
}

export async function getOverview() {
  return adminFetch<{ ok: boolean; overview: OverviewStats; alerts: Alert[] }>(
    "/admin/overview"
  );
}

export async function getUsers() {
  return adminFetch<{ ok: boolean; users: PlatformUser[] }>("/admin/users");
}

export async function updateUserStatus(id: number, status: string) {
  return adminFetch<{ ok: boolean; user: PlatformUser }>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getTradingSummary() {
  return adminFetch<{ ok: boolean; summary: TradingSummary }>("/admin/trading/summary");
}

export async function getTrades() {
  return adminFetch<{ ok: boolean; trades: Trade[] }>("/admin/trading/trades");
}

export async function getTradingPairs() {
  return adminFetch<{ ok: boolean; pairs: TradingPair[] }>("/admin/trading/pairs");
}

export async function updateTradingPair(pair: string, payload: { enabled?: boolean; maxSlippage?: number }) {
  return adminFetch<{ ok: boolean; pair: TradingPair }>(
    `/admin/trading/pairs/${encodeURIComponent(pair)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function getLiquiditySummary() {
  return adminFetch<{ ok: boolean; summary: LiquiditySummary }>("/admin/liquidity/summary");
}

export async function getLiquidityPools() {
  return adminFetch<{ ok: boolean; pools: LiquidityPool[] }>("/admin/liquidity/pools");
}

export async function getActivity(limit = 20) {
  return adminFetch<{ ok: boolean; events: ActivityEvent[] }>(`/admin/activity?limit=${limit}`);
}

export async function getContracts() {
  return adminFetch<{ ok: boolean; contracts: ContractRecord[] }>("/admin/contracts");
}

export async function reviewContract(address: string, payload: { status: string; notes?: string }) {
  return adminFetch<{ ok: boolean; contract: ContractRecord }>(
    `/admin/contracts/${address}/review`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function syncContractsToApp() {
  return adminFetch<{
    ok: boolean;
    syncedAt: string;
    approvedCount: number;
    files: { adminContracts: string; mainContractsPatched: boolean };
    message?: string;
  }>("/admin/contracts/sync", { method: "POST" });
}

export async function verifyContractOnExplorer(address: string) {
  return adminFetch<{
    ok: boolean;
    contract?: ContractRecord;
    verification?: ContractVerification;
    message?: string;
  }>(`/admin/contracts/${address}/verify`, { method: "POST" });
}

export async function getPlatformHealth() {
  return adminFetch<{ ok: boolean; health: PlatformHealth }>("/admin/stats/health");
}

export async function getStatsOverview() {
  return adminFetch<{ ok: boolean; stats: OverviewStats }>("/admin/stats/overview");
}

export async function getAuditLog() {
  return adminFetch<{ ok: boolean; entries: AuditEntry[] }>("/admin/auth/audit-log");
}

export interface Alert {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  at: string;
}

export interface PlatformUser {
  id: number;
  email: string;
  username: string;
  status: string;
  walletAddress?: string | null;
  lastLoginAt: string;
  sessionValid: boolean;
  riskLevel: string;
}

export interface TradingSummary {
  totalTrades: number;
  activePairs: number;
  liquidityHealth: string;
  volume24hUsd: number;
  failedTxRate: number;
  treasury: Record<string, number>;
  highRiskPairs: string[];
}

export interface Trade {
  id: string;
  pair: string;
  chainId: number;
  wallet: string;
  amountUsd: number;
  txHash: string;
  status: string;
  at: string;
}

export interface TradingPair {
  pair: string;
  enabled: boolean;
  maxSlippage: number;
  volume24hUsd: number;
  risk: string;
}

export interface LiquiditySummary {
  pools: number;
  totalValueLocked: number;
  avgApy: number;
  healthiestPool: string;
  riskyPools: string[];
  eventsLast24h: number;
  imbalancedPools: number;
}

export interface LiquidityPool {
  pair: string;
  chainId: number;
  tvlUsd: number;
  volume24hUsd: number;
  apy: number;
  feeTier: string;
  risk: string;
  contractAddress: string;
  verified: boolean;
}

export interface ActivityEvent {
  id: string;
  type: string;
  user: string;
  wallet?: string;
  pair?: string;
  amountUsd?: number;
  status?: string;
  at: string;
}

export interface ContractRecord {
  address: string;
  name: string;
  type: string;
  chainId: number;
  verified: boolean;
  auditStatus: string;
  status: string;
  lastReviewedAt: string | null;
  reviewedBy: string | null;
  notes: string;
}

export interface AuditEntry {
  id: number;
  action: string;
  adminEmail: string;
  role: string;
  at: string;
  ok: boolean;
  path?: string;
}

export interface ContractVerification {
  explorer: string;
  verified: boolean;
  contractName: string | null;
  compilerVersion: string | null;
  optimizationUsed: boolean;
  proxy: boolean;
  implementation: string | null;
  auditStatus: string;
  recommendation: string;
}

export interface PlatformHealth {
  status: string;
  checkedAt: string;
  services: Array<{
    service: string;
    status: string;
    url?: string;
    httpStatus?: number;
    lastBlock?: number;
    latencyMs?: number;
    error?: string;
  }>;
}
