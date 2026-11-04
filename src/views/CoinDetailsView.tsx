import React, { useState, useCallback, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveData } from "../hooks/useLiveData";
import { fetchCoinDetail, fetchCoinChart } from "../services/coingecko.service";
import {
  pgGetFavorites,
  pgAddFavorite,
  pgRemoveFavorite,
  getStoredUser,
} from "../services/pg.api.service";
import AuthModal from "../components/auth/AuthModal";

const coins = [
  { id: "bitcoin", label: "Bitcoin", symbol: "BTC", icon: "₿", color: "#f7931a" },
  { id: "ethereum", label: "Ethereum", symbol: "ETH", icon: "Ξ", color: "#00d4b5" },
  { id: "monero", label: "Monero", symbol: "XMR", icon: "ɱ", color: "#ff6600" },
  { id: "litecoin", label: "Litecoin", symbol: "LTC", icon: "Ł", color: "#a0aec0" },
];

const timeOptions = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "1Y", days: 365 },
];

const fmt = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${n?.toLocaleString()}`;

const TIP = {
  background: "#0c0c24",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
};

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-7 h-7 border-2 border-indigo-800 border-t-cyan-400 rounded-full animate-spin" />
  </div>
);

export default function CoinDetailsView() {
  const [activeCoin, setActiveCoin] = useState(coins[1]);
  const [activeTime, setActiveTime] = useState(timeOptions[0]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getStoredUser());

  useEffect(() => {
    if (!isLoggedIn) return;
    pgGetFavorites().then((res) => {
      if (res.success) setFavIds(new Set(res.data.map((f) => f.coin_id)));
    }).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (!favError) return;
    const id = setTimeout(() => setFavError(""), 4000);
    return () => clearTimeout(id);
  }, [favError]);

  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    setFavLoading(true);
    setFavError("");
    try {
      if (favIds.has(activeCoin.id)) {
        await pgRemoveFavorite(activeCoin.id);
        setFavIds((prev) => { const s = new Set(prev); s.delete(activeCoin.id); return s; });
      } else {
        await pgAddFavorite(activeCoin.id, activeCoin.label, activeCoin.symbol);
        setFavIds((prev) => new Set(Array.from(prev).concat(activeCoin.id)));
      }
    } catch {
      setFavError("Could not update favorites — check your connection");
    } finally {
      setFavLoading(false);
    }
  };

  const detailFetcher = useCallback(
    () => fetchCoinDetail(activeCoin.id),
    [activeCoin.id]
  );
  const chartFetcher = useCallback(
    () => fetchCoinChart(activeCoin.id, activeTime.days),
    [activeCoin.id, activeTime.days]
  );

  const { data: detail, loading: dLoading, lastUpdated } = useLiveData(detailFetcher, 30000);
  const { data: chartData, loading: cLoading } = useLiveData(chartFetcher, 30000);

  const md = detail?.market_data;
  const price = md?.current_price?.usd;
  const change24h = md?.price_change_percentage_24h;
  const volume = md?.total_volume?.usd;
  const marketCap = md?.market_cap?.usd;
  const positive = (change24h ?? 0) >= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={() => setIsLoggedIn(true)} />
      )}

      
      {favError && (
        <div className="fixed top-20 right-4 z-50 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm shadow-lg backdrop-blur">
          {favError}
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-slate-100 text-2xl font-bold">Coin Details</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${
              favIds.has(activeCoin.id)
                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
                : "border-indigo-800/50 text-slate-500 hover:text-slate-300 hover:border-indigo-700/50"
            }`}
          >
            <span>{favIds.has(activeCoin.id) ? "★" : "☆"}</span>
            <span>{favIds.has(activeCoin.id) ? "Saved" : "Save"}</span>
          </button>
          <div className="flex gap-1 bg-[#0c0c24] rounded-xl p-1 border border-indigo-900/40">
            {coins.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCoin(c)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeCoin.id === c.id
                    ? "bg-indigo-950 border border-indigo-700/50 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: c.color }}
                >
                  {c.icon}
                </span>
                <span className="hidden sm:inline">{c.label}</span>
                <span className="sm:hidden">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        
        <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-semibold">About</span>
            {lastUpdated && (
              <span className="text-slate-600 text-xs">{lastUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </div>

          {dLoading ? (
            <div className="flex flex-col gap-3">
              <div className="h-14 w-14 rounded-full bg-indigo-900/20 animate-pulse" />
              <div className="h-4 w-32 bg-indigo-900/20 animate-pulse rounded" />
              <div className="h-3 w-full bg-indigo-900/20 animate-pulse rounded" />
              <div className="h-3 w-5/6 bg-indigo-900/20 animate-pulse rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {detail?.image?.small ? (
                  <img src={detail.image.small} alt={activeCoin.label} className="w-14 h-14 rounded-full ring-2 ring-indigo-900/50" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                    style={{ background: activeCoin.color }}
                  >
                    {activeCoin.icon}
                  </div>
                )}
                <div>
                  <div className="text-slate-100 font-bold text-lg">{activeCoin.label}</div>
                  <div className="text-slate-500 text-sm uppercase tracking-wide">{activeCoin.symbol}</div>
                  <div className="text-slate-600 text-xs mt-0.5">
                    1 {activeCoin.symbol} = ${price?.toLocaleString()} USD
                  </div>
                </div>
              </div>
              {detail?.description?.en && (
                <p className="text-slate-500 text-xs leading-5 line-clamp-8">
                  {detail.description.en.replace(/<[^>]+>/g, "")}
                </p>
              )}
            </>
          )}
        </div>

        
        <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="text-slate-200 font-semibold text-lg">Chart</div>
              <div className="text-slate-600 text-xs">Real-time price</div>
            </div>
            <div className="flex gap-1.5">
              {timeOptions.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setActiveTime(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTime.label === t.label
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-500 border border-indigo-900/40 hover:text-slate-300 hover:border-indigo-700/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          
          <div className="flex gap-6 mb-6 flex-wrap">
            <div>
              <div className="text-slate-500 text-xs mb-1">Price</div>
              {dLoading ? (
                <div className="h-8 w-32 bg-indigo-900/20 animate-pulse rounded" />
              ) : (
                <div className="text-slate-100 text-2xl font-bold">${price?.toLocaleString()}</div>
              )}
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">24h Change</div>
              <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-lg ${positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                {positive ? "▲" : "▼"} {Math.abs(change24h ?? 0).toFixed(2)}%
              </span>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Volume (24h)</div>
              <div className="text-slate-200 font-semibold">{volume ? fmt(volume) : "—"}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Market Cap</div>
              <div className="text-slate-200 font-semibold">{marketCap ? fmt(marketCap) : "—"}</div>
            </div>
          </div>

          {cLoading ? (
            <Spinner />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData ?? []} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeCoin.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={activeCoin.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={TIP}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, activeCoin.symbol]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={activeCoin.color}
                    strokeWidth={2.5}
                    fill="url(#coinGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: activeCoin.color, stroke: "#0c0c24", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
