import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { adminLogout, clearAdminSession } from "../api";

const navItems = [
  { href: "/admin", label: "Command Center" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/trading", label: "Trading" },
  { href: "/admin/liquidity", label: "Liquidity" },
  { href: "/admin/activity", label: "Activity" },
  { href: "/admin/contracts", label: "Contracts" },
  { href: "/admin/stats", label: "Statistics" },
];

export function AdminLayout({
  title,
  subtitle,
  adminName,
  children,
}: {
  title: string;
  subtitle?: string;
  adminName?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {

    } finally {
      clearAdminSession();
      router.push("/admin/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <div className="border-b border-indigo-900/40 bg-[#0b0d1a]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">NovaFi Admin</p>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {adminName && <span className="text-sm text-slate-300">{adminName}</span>}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-indigo-900/50 px-4 py-2 text-sm text-slate-300 hover:border-red-500/50 hover:text-red-300"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-indigo-900/40 bg-[#0b0d1a]/70 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-gradient-to-r from-cyan-500/20 to-violet-600/20 text-cyan-300"
                      : "text-slate-400 hover:bg-[#10162b] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-indigo-900/40 bg-[#0b0d1a]/70 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-300",
    approved: "bg-emerald-500/15 text-emerald-300",
    confirmed: "bg-emerald-500/15 text-emerald-300",
    success: "bg-emerald-500/15 text-emerald-300",
    idle: "bg-slate-500/15 text-slate-300",
    pending_review: "bg-amber-500/15 text-amber-300",
    flagged: "bg-amber-500/15 text-amber-300",
    suspended: "bg-red-500/15 text-red-300",
    failed: "bg-red-500/15 text-red-300",
    high: "bg-red-500/15 text-red-300",
    medium: "bg-amber-500/15 text-amber-300",
    low: "bg-emerald-500/15 text-emerald-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || "bg-slate-500/15 text-slate-300"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-indigo-900/40 bg-[#0b0d1a]/70 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
