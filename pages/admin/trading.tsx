import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatCard, StatusBadge } from "../../src/admin/components/AdminLayout";
import {
  adminMe,
  getTradingPairs,
  getTradingSummary,
  getTrades,
  TradingPair,
  Trade,
  TradingSummary,
  updateTradingPair,
} from "../../src/admin/api";

export default function AdminTradingPage() {
  const [adminName, setAdminName] = useState("");
  const [summary, setSummary] = useState<TradingSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, summaryData, tradesData, pairsData] = await Promise.all([
          adminMe(),
          getTradingSummary(),
          getTrades(),
          getTradingPairs(),
        ]);
        setAdminName(me.admin.name);
        setSummary(summaryData.summary);
        setTrades(tradesData.trades);
        setPairs(pairsData.pairs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trading data.");
      }
    }

    void load();
  }, []);

  async function togglePair(pair: string, enabled: boolean) {
    try {
      await updateTradingPair(pair, { enabled });
      setPairs((current) =>
        current.map((item) => (item.pair === pair ? { ...item, enabled } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pair.");
    }
  }

  return (
    <AdminLayout title="Trading Operations" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Trades" value={summary?.totalTrades ?? "—"} />
        <StatCard label="Active Pairs" value={summary?.activePairs ?? "—"} />
        <StatCard
          label="Volume (24h)"
          value={summary?.volume24hUsd ? `$${Number(summary.volume24hUsd).toLocaleString()}` : "—"}
        />
        <StatCard label="Failed TX Rate" value={summary?.failedTxRate ? `${summary.failedTxRate}%` : "—"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionPanel title="Recent Trades">
          <div className="space-y-3">
            {trades.slice(0, 8).map((trade) => (
              <div key={trade.id} className="rounded-xl border border-indigo-900/30 bg-[#10162b] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{trade.pair}</p>
                  <StatusBadge status={trade.status} />
                </div>
                <p className="mt-1 text-sm text-slate-400">${trade.amountUsd.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-500">{trade.wallet}</p>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Pair Governance">
          <div className="space-y-3">
            {pairs.map((pair) => (
              <div
                key={pair.pair}
                className="flex items-center justify-between rounded-xl border border-indigo-900/30 bg-[#10162b] p-4"
              >
                <div>
                  <p className="font-medium">{pair.pair}</p>
                  <p className="text-xs text-slate-500">
                    Slippage max {pair.maxSlippage}% · ${pair.volume24hUsd.toLocaleString()} vol
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void togglePair(pair.pair, !pair.enabled)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    pair.enabled
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-red-500/15 text-red-300"
                  }`}
                >
                  {pair.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </AdminLayout>
  );
}
