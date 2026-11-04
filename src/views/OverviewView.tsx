import React, { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLiveData } from "../hooks/useLiveData";
import { fetchTopCoins, fetchGlobal, fetchCoinChart, fetchCoinVolumeChart, CoinMarket } from "../services/coingecko.service";

const fmt = (n: number) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T`
  : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
  : `$${n.toLocaleString()}`;

const TIP = {
  background: "#0c0c24",
  border: "1px solid rgba(99,102,241,0.3)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
};

const Skeleton = ({ w = "w-24" }: { w?: string }) => (
  <div className={`h-9 ${w} rounded-lg bg-indigo-900/20 animate-pulse mt-1`} />
);

const Spinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-7 h-7 border-2 border-indigo-800 border-t-cyan-400 rounded-full animate-spin" />
  </div>
);

const SparkLine = ({ prices, positive }: { prices: number[]; positive: boolean }) => {
  const data = prices.slice(-20).map((p, i) => ({ i, p }));
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="p" stroke={color} strokeWidth={1.5}
            fill={`url(#spark${positive})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function OverviewView() {
  const [activeTab, setActiveTab] = useState<"Overview" | "Tokens">("Overview");
  const [search, setSearch] = useState("");

  const globalFetcher = useCallback(() => fetchGlobal(), []);
  const coinsFetcher = useCallback(() => fetchTopCoins(activeTab === "Tokens" ? 50 : 10), [activeTab]);
  const chartFetcher = useCallback(() => fetchCoinChart("bitcoin", 1), []);
  const volumeFetcher = useCallback(() => fetchCoinVolumeChart("bitcoin", 1), []);

  const { data: global, loading: gLoading, lastUpdated: gUpdated } = useLiveData(globalFetcher);
  const { data: coins, loading: cLoading, lastUpdated: cUpdated } = useLiveData(coinsFetcher);
  const { data: chartData, loading: chLoading } = useLiveData(chartFetcher);
  const { data: volumeData, loading: vLoading } = useLiveData(volumeFetcher);

  const barData = volumeData
    ? volumeData.filter((_, i) => i % 3 === 0).map((d) => ({ t: d.time, v: d.price }))
    : [];

  const q = search.trim().toLowerCase();
  const filteredCoins = (coins ?? []).filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">

      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-1">
          {(["Overview", "Tokens"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-indigo-950 border border-indigo-700/50 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >{tab}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-4 py-2.5 w-full sm:w-auto focus-within:border-cyan-500/40 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="bg-transparent text-sm text-slate-300 outline-none placeholder-slate-600 flex-1"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-600 hover:text-white text-xs transition-colors">✕</button>
          )}
        </div>
      </div>

      
      {activeTab === "Overview" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-slate-500 text-sm mb-1">Global Market Cap</p>
              {gLoading ? <Skeleton w="w-44" /> : (
                <p className="text-3xl font-bold text-slate-100">{global ? fmt(global.total_market_cap.usd) : "—"}</p>
              )}
              <p className="text-slate-600 text-xs mt-1">Chart: BTC price · 24h</p>
            </div>
            {gUpdated && <span className="text-slate-600 text-xs mt-1 shrink-0">{gUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
          {chLoading ? <Spinner /> : (
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip contentStyle={TIP} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "BTC"]} />
                  <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fill="url(#gradCyan)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-6">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-slate-500 text-sm mb-1">Volume 24H</p>
              {gLoading ? <Skeleton w="w-36" /> : (
                <p className="text-3xl font-bold text-slate-100">{global ? fmt(global.total_volume.usd) : "—"}</p>
              )}
              <p className="text-slate-600 text-xs mt-1">Chart: BTC trading volume · 24h</p>
            </div>
            {gUpdated && <span className="text-slate-600 text-xs mt-1 shrink-0">{gUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
          {vLoading ? <Spinner /> : (
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="t" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip contentStyle={TIP} formatter={(v: any) => [fmt(Number(v)), "BTC Volume"]} />
                  <Bar dataKey="v" fill="rgba(99,102,241,0.5)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      )}

      
      <div className="rounded-2xl overflow-hidden border border-indigo-900/40"
        style={{ background: "linear-gradient(160deg, #0f0f2e 0%, #0c0c24 40%, #080818 100%)" }}
      >
        
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-indigo-900/40"
          style={{ background: "linear-gradient(90deg, rgba(6,182,212,0.06) 0%, rgba(99,102,241,0.08) 50%, rgba(124,58,237,0.06) 100%)" }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(124,58,237,0.4), transparent)" }}
          />
          <h2 className="text-slate-100 font-bold text-lg">{activeTab === "Tokens" ? "Top 50 Tokens" : "Top Tokens"}</h2>
          <div className="flex items-center gap-3">
            {cUpdated && <span className="text-slate-600 text-xs hidden sm:block">Updated {cUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>}
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live · 30s</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 100%)" }}>
                {["#", "Token", "Price", "24h", "Volume 24h", "Market Cap", "7D"].map((h) => (
                  <th key={h} className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wider px-5 py-3.5 border-b border-indigo-900/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-indigo-900/20">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 w-16 rounded bg-indigo-900/20 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredCoins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-600 text-sm">
                        No tokens match "{search}"
                      </td>
                    </tr>
                  )
                : filteredCoins.map((coin: CoinMarket, i: number) => {
                    const pos = coin.price_change_percentage_24h >= 0;
                    return (
                      <tr key={coin.id}
                        className="border-b border-indigo-900/20 transition-all group"
                        style={i % 2 === 1 ? { background: "rgba(99,102,241,0.03)" } : {}}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            "linear-gradient(90deg, rgba(6,182,212,0.07) 0%, rgba(99,102,241,0.07) 100%)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            i % 2 === 1 ? "rgba(99,102,241,0.03)" : "";
                        }}
                      >
                        <td className="px-5 py-3.5 text-slate-600 text-sm font-mono">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full ring-1 ring-indigo-900/50" />
                            <div>
                              <div className="text-slate-100 text-sm font-semibold">{coin.name}</div>
                              <div className="text-slate-600 text-xs uppercase">{coin.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-100 text-sm font-semibold font-mono">${coin.current_price.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${pos ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                            {pos ? "▲" : "▼"} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-sm">{fmt(coin.total_volume)}</td>
                        <td className="px-5 py-3.5 text-slate-400 text-sm">{fmt(coin.market_cap)}</td>
                        <td className="px-5 py-3.5">{coin.sparkline_in_7d && <SparkLine prices={coin.sparkline_in_7d.price} positive={pos} />}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
