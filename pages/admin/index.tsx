import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatCard, StatusBadge } from "../../src/admin/components/AdminLayout";
import { adminMe, getOverview, Alert, OverviewStats } from "../../src/admin/api";

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, data] = await Promise.all([adminMe(), getOverview()]);
        setAdminName(me.admin.name);
        setOverview(data.overview);
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      }
    }

    void load();
  }, []);

  if (error) {
    return (
      <AdminLayout title="Command Center">
        <p className="text-red-400">{error}</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Command Center"
      subtitle="Live platform pulse across users, trading, liquidity, and security."
      adminName={adminName}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Users (24h)" value={overview?.activeUsers24h ?? "—"} />
        <StatCard
          label="Swap Volume (24h)"
          value={overview?.swapVolume24hUsd ? `$${Number(overview.swapVolume24hUsd).toLocaleString()}` : "—"}
        />
        <StatCard
          label="TVL"
          value={overview?.tvlUsd ? `$${Number(overview.tvlUsd).toLocaleString()}` : "—"}
        />
        <StatCard label="Open Alerts" value={overview?.openAlerts ?? "—"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionPanel title="Alerts">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-indigo-900/30 bg-[#10162b] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{alert.title}</p>
                  <StatusBadge status={alert.severity} />
                </div>
                <p className="mt-2 text-sm text-slate-400">{alert.message}</p>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Chain Health">
          <div className="space-y-3">
            {overview?.chainHealth.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center justify-between rounded-xl border border-indigo-900/30 bg-[#10162b] px-4 py-3"
              >
                <div>
                  <p className="font-medium">{chain.name}</p>
                  <p className="text-xs text-slate-500">{chain.symbol}</p>
                </div>
                <StatusBadge status={chain.status} />
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </AdminLayout>
  );
}
