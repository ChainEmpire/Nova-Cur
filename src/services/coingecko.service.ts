const BASE = "https://api.coingecko.com/api/v3";
const TTL = 30_000;

interface CacheEntry { data: unknown; ts: number }
const cache = new Map<string, CacheEntry>();

async function cachedFetch<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko error ${res.status}: ${url}`);
  const data = await res.json();
  cache.set(url, { data, ts: Date.now() });
  return data as T;
}

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface GlobalData {
  total_market_cap: { usd: number };
  total_volume: { usd: number };
  market_cap_change_percentage_24h_usd: number;
}

export interface ChartPoint { time: string; price: number }

export async function fetchTopCoins(limit = 10): Promise<CoinMarket[]> {
  return cachedFetch(
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true`
  );
}

export async function fetchGlobal(): Promise<GlobalData> {
  const json = await cachedFetch<{ data: GlobalData }>(`${BASE}/global`);
  return json.data;
}

export async function fetchCoinChart(
  coinId: string,
  days: number | string = 1
): Promise<ChartPoint[]> {
  const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const json = await cachedFetch<{ prices: [number, number][] }>(url);
  return json.prices.map(([ts, price]) => ({
    time: new Date(ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    price: parseFloat(price.toFixed(4)),
  }));
}

export async function fetchCoinVolumeChart(
  coinId: string,
  days: number | string = 1
): Promise<ChartPoint[]> {
  const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
  const json = await cachedFetch<{ total_volumes: [number, number][] }>(url);
  return json.total_volumes.map(([ts, vol]) => ({
    time: new Date(ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    price: Math.round(vol),
  }));
}

export interface CoinDetail {
  image: { small: string; large: string };
  description: { en: string };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    total_volume: { usd: number };
    market_cap: { usd: number };
  };
}

export async function fetchTokenPrices(ids: string[]): Promise<Record<string, number>> {
  const joined = ids.join(",");
  const data = await cachedFetch<Record<string, { usd: number }>>(
    `${BASE}/simple/price?ids=${joined}&vs_currencies=usd`
  );
  const result: Record<string, number> = {};
  for (const [id, val] of Object.entries(data)) {
    result[id] = val.usd;
  }
  return result;
}

export async function fetchCoinDetail(coinId: string): Promise<CoinDetail> {
  return cachedFetch<CoinDetail>(
    `${BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
}
