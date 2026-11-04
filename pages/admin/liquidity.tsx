import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatCard, StatusBadge } from "../../src/admin/components/AdminLayout";
import {
  adminMe,
  getLiquidityPools,
  getLiquiditySummary,
  LiquidityPool,
  LiquiditySummary,
} from "../../src/admin/api";

export default function AdminLiquidityPage() {
  const [adminName, setAdminName] = useState("");
  const [summary, setSummary] = useState<LiquiditySummary | null>(null);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, summaryData, poolsData] = await Promise.all([
          adminMe(),
          getLiquiditySummary(),
          getLiquidityPools(),
        ]);
        setAdminName(me.admin.name);
        setSummary(summaryData.summary);
        setPools(poolsData.pools);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load liquidity data.");
      }
    }

    void load();
  }, []);

  return (
    <AdminLayout title="Liquidity Pooling" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pools" value={summary?.pools ?? "—"} />
        <StatCard
          label="Total TVL"
          value={summary?.totalValueLocked ? `$${Number(summary.totalValueLocked).toLocaleString()}` : "—"}
        />
        <StatCard label="Average APY" value={summary?.avgApy ? `${summary.avgApy}%` : "—"} />
        <StatCard label="Imbalanced Pools" value={summary?.imbalancedPools ?? "—"} />
      </div>

      <SectionPanel title="Pool Registry">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Pair</th>
                <th className="pb-3 pr-4">TVL</th>
                <th className="pb-3 pr-4">APY</th>
                <th className="pb-3 pr-4">Risk</th>
                <th className="pb-3">Verified</th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr key={pool.pair} className="border-t border-indigo-900/20">
                  <td className="py-3 pr-4 font-medium">{pool.pair}</td>
                  <td className="py-3 pr-4">${pool.tvlUsd.toLocaleString()}</td>
                  <td className="py-3 pr-4">{pool.apy}%</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={pool.risk} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={pool.verified ? "approved" : "pending_review"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </AdminLayout>
  );
}
