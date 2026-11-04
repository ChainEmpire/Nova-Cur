import { useEffect, useState } from "react";
import { AdminLayout, SectionPanel, StatCard } from "../../src/admin/components/AdminLayout";
import { adminMe, getStatsOverview, getAuditLog, AuditEntry, OverviewStats } from "../../src/admin/api";

export default function AdminStatsPage() {
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [me, statsData, auditData] = await Promise.all([
          adminMe(),
          getStatsOverview(),
          getAuditLog(),
        ]);
        setAdminName(me.admin.name);
        setStats(statsData.stats);
        setAuditLog(auditData.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load statistics.");
      }
    }

    void load();
  }, []);

  return (
    <AdminLayout title="Statistics & Audit" adminName={adminName}>
      {error && <p className="mb-4 text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="Total Trades (24h)" value={stats?.totalTrades24h ?? "—"} />
        <StatCard label="Pool Count" value={stats?.poolCount ?? "—"} />
        <StatCard label="Pending Reviews" value={stats?.pendingContractReviews ?? "—"} />
      </div>

      <SectionPanel title="Audit Log">
        <div className="space-y-3">
          {auditLog.length === 0 && (
            <p className="text-sm text-slate-500">No audit entries yet. Actions will appear here.</p>
          )}
          {auditLog.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-indigo-900/30 bg-[#10162b] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{entry.action}</p>
                <p className="text-xs text-slate-500">{new Date(entry.at).toLocaleString()}</p>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {entry.adminEmail} · {entry.role}
              </p>
            </div>
          ))}
        </div>
      </SectionPanel>
    </AdminLayout>
  );
}
