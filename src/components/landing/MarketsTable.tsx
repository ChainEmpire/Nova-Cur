import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MARKETS, type Market } from "../../lib/landing/markets";
import Sparkline from "./Sparkline";

type FilterTab = "all" | "gainers" | "losers";
type SortKey = "name" | "price" | "change24h" | "volumeUsd";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir };
type LiveTick = { price: number; dir: "up" | "down" | null; tick: number };

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
];

const SORTABLE_COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: "name", label: "Market" },
  { key: "price", label: "Price" },
  { key: "change24h", label: "24h Change" },
];

function matchesTab(market: Market, tab: FilterTab): boolean {
  if (tab === "gainers") return market.change24h > 0;
  if (tab === "losers") return market.change24h < 0;
  return true;
}

function compareBy(key: SortKey, dir: SortDir) {
  const sign = dir === "asc" ? 1 : -1;
  return (a: Market, b: Market): number => {
    if (key === "name") return a.name.localeCompare(b.name) * sign;
    return (a[key] - b[key]) * sign;
  };
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span
      aria-hidden
      className={`ml-1 inline-block text-[9px] transition-all ${
        active ? "text-nova-cyan opacity-100" : "opacity-30"
      } ${active && dir === "asc" ? "rotate-180" : ""}`}
    >
      ▼
    </span>
  );
}

export default function MarketsTable() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortState>({ key: "volumeUsd", dir: "desc" });
  const [watchlist, setWatchlist] = useState<ReadonlySet<string>>(new Set());
  const [live, setLive] = useState<Record<string, LiveTick>>(() =>
    Object.fromEntries(MARKETS.map((m) => [m.name, { price: m.price, dir: null, tick: 0 }]))
  );
  const tickRef = useRef(0);


  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      setLive((prev) => {
        const next = { ...prev };
        const names = MARKETS.map((m) => m.name);
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const name = names[Math.floor(Math.random() * names.length)];
          const cur = next[name];
          const delta = (Math.random() - 0.48) * 0.002;
          const price = Math.max(0.99, cur.price * (1 + delta));
          next[name] = {
            price,
            dir: price >= cur.price ? "up" : "down",
            tick: tickRef.current,
          };
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const toggleWatch = (name: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" }
    );
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = MARKETS.filter(
      (m) =>
        matchesTab(m, tab) &&
        (!q || m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
    );

    const cmp = compareBy(sort.key, sort.dir);
    return [...filtered].sort((a, b) => {
      const wa = watchlist.has(a.name) ? 0 : 1;
      const wb = watchlist.has(b.name) ? 0 : 1;
      return wa - wb || cmp(a, b);
    });
  }, [query, tab, sort, watchlist]);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nova-emerald opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-nova-emerald" />
            </span>
            Live markets
          </h2>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <div
              role="tablist"
              aria-label="Filter markets"
              className="flex rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.id
                      ? "bg-gradient-nova text-nova-bg"
                      : "text-nova-muted hover:text-nova-text"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-nova-text placeholder:text-nova-muted backdrop-blur-md transition-colors focus:border-nova-cyan/60 focus:outline-none sm:w-56"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-nova-muted">
              <tr>
                <th className="w-10 px-3 py-3" aria-label="Watchlist" />
                {SORTABLE_COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center transition-colors hover:text-nova-text"
                    >
                      {col.label}
                      <SortArrow active={sort.key === col.key} dir={sort.dir} />
                    </button>
                  </th>
                ))}
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Last 24h</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("volumeUsd")}
                    className="inline-flex items-center transition-colors hover:text-nova-text"
                  >
                    24h Volume
                    <SortArrow active={sort.key === "volumeUsd"} dir={sort.dir} />
                  </button>
                </th>
                <th className="w-24 px-4 py-3" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((market) => {
                const tick = live[market.name];
                const watched = watchlist.has(market.name);
                return (
                  <tr
                    key={market.name}
                    className="group border-t border-white/[0.06] transition-colors hover:bg-white/[0.05]"
                  >
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        onClick={() => toggleWatch(market.name)}
                        aria-label={
                          watched
                            ? `Remove ${market.name} from watchlist`
                            : `Add ${market.name} to watchlist`
                        }
                        aria-pressed={watched}
                        className={`text-base transition-all hover:scale-125 ${
                          watched
                            ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                            : "text-white/20 hover:text-white/50"
                        }`}
                      >
                        {watched ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={market.icon}
                          alt={market.name}
                          width={32}
                          height={32}
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-nova-text">{market.symbol}</div>
                          <div className="text-xs text-nova-muted">{market.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-nova-text tabular-nums">
                      <span
                        key={`${market.name}-${tick.tick}`}
                        className={
                          tick.dir === "up"
                            ? "animate-[flash-up_1.2s_ease-out]"
                            : tick.dir === "down"
                              ? "animate-[flash-down_1.2s_ease-out]"
                              : undefined
                        }
                      >
                        ${tick.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-4 font-medium tabular-nums ${
                        market.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                          market.change24h >= 0 ? "bg-emerald-400/10" : "bg-rose-400/10"
                        }`}
                      >
                        {market.change24h >= 0 ? "▲" : "▼"}{" "}
                        {Math.abs(market.change24h).toFixed(2)}%
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <Sparkline seed={market.name} positive={market.change24h >= 0} />
                    </td>
                    <td className="hidden px-4 py-4 text-nova-muted sm:table-cell">
                      {market.volume24h}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href="/login"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                          }
                        }}
                        className="inline-block rounded-full border border-nova-cyan/30 bg-nova-cyan/10 px-4 py-1.5 text-xs font-semibold text-nova-cyan opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-nova-muted">
                    No markets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-nova-muted">
          Prices are illustrative and for demonstration purposes only. Star a market to
          pin it to the top.
        </p>
      </div>
    </section>
  );
}
