import React, { useState, useEffect, useMemo } from "react";

const categories = ["ALL", "Celebrities", "Gaming", "Sport", "Music", "Crypto"];

interface Nft {
  id: number;
  name: string;
  category: string;
  priceBnb: number;
  total: string;
  endsAt: number;
}

const HOUR = 3600_000;

const nfts: Nft[] = [
  { id: 1, name: "ArtCrypto",     category: "Crypto",      priceBnb: 0.25, total: "1 of 321", endsAt: Date.now() + 3.8 * HOUR },
  { id: 2, name: "NeonRider",     category: "Gaming",      priceBnb: 0.42, total: "3 of 150", endsAt: Date.now() + 7.2 * HOUR },
  { id: 3, name: "GoldenVoice",   category: "Music",       priceBnb: 1.1,  total: "1 of 50",  endsAt: Date.now() + 1.4 * HOUR },
  { id: 4, name: "MatchPoint",    category: "Sport",       priceBnb: 0.18, total: "7 of 500", endsAt: Date.now() + 12 * HOUR },
  { id: 5, name: "StarPortrait",  category: "Celebrities", priceBnb: 2.4,  total: "1 of 10",  endsAt: Date.now() + 26 * HOUR },
  { id: 6, name: "PixelWarrior",  category: "Gaming",      priceBnb: 0.33, total: "12 of 999", endsAt: Date.now() + 5.5 * HOUR },
  { id: 7, name: "ChainMelody",   category: "Music",       priceBnb: 0.75, total: "2 of 80",  endsAt: Date.now() + 9.1 * HOUR },
  { id: 8, name: "SatoshiDream",  category: "Crypto",      priceBnb: 0.6,  total: "5 of 210", endsAt: Date.now() + 2.7 * HOUR },
];

interface Collection {
  id: number;
  name: string;
  category: string;
  items: number;
  floorBnb: number;
  volumeBnb: number;
}

const collections: Collection[] = [
  { id: 1, name: "CryptoPunks BSC",   category: "Crypto",      items: 10000, floorBnb: 1.2,  volumeBnb: 8400 },
  { id: 2, name: "Arena Legends",     category: "Gaming",      items: 5000,  floorBnb: 0.35, volumeBnb: 2100 },
  { id: 3, name: "Beat Blocks",       category: "Music",       items: 2500,  floorBnb: 0.6,  volumeBnb: 1450 },
  { id: 4, name: "Hall of Fame",      category: "Sport",       items: 1200,  floorBnb: 0.9,  volumeBnb: 980 },
  { id: 5, name: "Icons Vault",       category: "Celebrities", items: 500,   floorBnb: 3.1,  volumeBnb: 5200 },
  { id: 6, name: "Meta Racers",       category: "Gaming",      items: 8000,  floorBnb: 0.22, volumeBnb: 1800 },
];

const sellers = [
  { name: "Sam Lee",       handle: "@samlee",       following: false },
  { name: "Jane Donald",   handle: "@janedoe",      following: true },
  { name: "Lois Lane",     handle: "@supermanchic", following: false },
  { name: "Barry Allen",   handle: "@flash",        following: false },
  { name: "Jenner Foster", handle: "@jennerfos",    following: false },
  { name: "Diana Prince",  handle: "@wondergal",    following: false },
  { name: "Clark Kent",    handle: "@dailykent",    following: true },
  { name: "Bruce Wayne",   handle: "@notbatman",    following: false },
];

const avatarColors = ["#06b6d4", "#f7931a", "#10b981", "#6366f1", "#a855f7"];

const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const formatTimeLeft = (ms: number) => {
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}h ${m}m ${s}s left`;
};



function BidModal({ nft, onClose }: { nft: Nft; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [placed, setPlaced] = useState(false);
  const num = parseFloat(amount);
  const valid = !isNaN(num) && num >= nft.priceBnb;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#080818] border border-indigo-900/50 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-100 font-bold">Place a bid</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">✕</button>
        </div>

        {placed ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-slate-100 font-semibold mb-1">Bid placed!</p>
            <p className="text-slate-500 text-sm mb-5">
              Your bid of {num} BNB on {nft.name} #{nft.id} was registered.
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-4">
              <span>{nft.name} #{nft.id}</span>
              <span>Min. bid: <span className="text-slate-200 font-semibold">{nft.priceBnb} BNB</span></span>
            </div>
            <div className="relative mb-2">
              <input
                type="number"
                min={nft.priceBnb}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${nft.priceBnb}`}
                autoFocus
                className="w-full bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-4 py-3 text-slate-100 text-sm outline-none placeholder-slate-600 focus:border-cyan-500/50 transition-all pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">BNB</span>
            </div>
            {amount && !valid && (
              <p className="text-red-400 text-xs mb-2">Bid must be at least {nft.priceBnb} BNB</p>
            )}
            <button
              disabled={!valid}
              onClick={() => setPlaced(true)}
              className={`w-full mt-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                valid
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-cyan-500/15"
                  : "bg-indigo-950 border border-indigo-900/40 text-slate-500 cursor-not-allowed"
              }`}
            >
              Confirm bid
            </button>
          </>
        )}
      </div>
    </div>
  );
}



const NFTCard = ({ nft, now, onBid }: { nft: Nft; now: number; onBid: (n: Nft) => void }) => (
  <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group">
    <div className="h-44 relative overflow-hidden">
      <div
        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        style={{
          background: `linear-gradient(135deg,
            hsl(${(nft.id * 47) % 360},70%,40%) 0%,
            hsl(${(nft.id * 47 + 120) % 360},75%,50%) 50%,
            hsl(${(nft.id * 47 + 240) % 360},70%,45%) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="absolute bottom-2.5 left-2.5 flex -space-x-2">
        {[0, 1, 2].map((j) => (
          <div
            key={j}
            className="w-7 h-7 rounded-full border-2 border-[#0c0c24] flex items-center justify-center text-white text-xs font-bold shadow-lg"
            style={{ background: avatarColors[(nft.id + j) % avatarColors.length] }}
          >
            {String.fromCharCode(65 + ((nft.id + j) % 26))}
          </div>
        ))}
      </div>

      <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md rounded-lg px-2.5 py-1 border border-white/10">
        <span className="text-white text-[10px] font-semibold tracking-wide">{nft.total}</span>
      </div>
    </div>

    <div className="p-4">
      <div className="text-slate-100 font-bold text-sm mb-2.5">{nft.name} #{nft.id}</div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm">⬡</span>
          <span className="text-slate-200 text-xs font-semibold">{nft.priceBnb} BNB</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="text-slate-500 text-[10px] tabular-nums">{formatTimeLeft(nft.endsAt - now)}</span>
        </div>
      </div>

      <button
        onClick={() => onBid(nft)}
        className="relative w-full py-2.5 rounded-xl text-white text-xs font-bold tracking-wide overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 transition-opacity duration-300" />
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center justify-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Place a bid
        </span>
      </button>
    </div>
  </div>
);

const CollectionCard = ({ col }: { col: Collection }) => (
  <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] overflow-hidden hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 group">
    <div className="h-28 relative overflow-hidden">
      <div
        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        style={{
          background: `linear-gradient(120deg,
            hsl(${(col.id * 61) % 360},65%,35%) 0%,
            hsl(${(col.id * 61 + 90) % 360},70%,45%) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute bottom-2.5 left-3 text-white font-bold text-sm drop-shadow">{col.name}</span>
    </div>
    <div className="p-4 grid grid-cols-3 gap-2 text-center">
      <div>
        <div className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">Items</div>
        <div className="text-slate-200 text-xs font-semibold">{col.items.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">Floor</div>
        <div className="text-slate-200 text-xs font-semibold">{col.floorBnb} BNB</div>
      </div>
      <div>
        <div className="text-slate-600 text-[10px] uppercase tracking-wide mb-0.5">Volume</div>
        <div className="text-slate-200 text-xs font-semibold">{col.volumeBnb.toLocaleString()} BNB</div>
      </div>
    </div>
  </div>
);



export default function NFTView() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [view, setView] = useState<"NFTs" | "Collections">("NFTs");
  const [search, setSearch] = useState("");
  const [bidding, setBidding] = useState<Nft | null>(null);
  const [showAllSellers, setShowAllSellers] = useState(false);
  const [following, setFollowing] = useState<Record<number, boolean>>(
    Object.fromEntries(sellers.map((s, i) => [i, s.following]))
  );
  const now = useNow();

  const toggleFollow = (index: number) => {
    setFollowing((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const q = search.trim().toLowerCase();

  const filteredNfts = useMemo(
    () =>
      nfts.filter(
        (n) =>
          (activeCategory === "ALL" || n.category === activeCategory) &&
          (!q || `${n.name} #${n.id}`.toLowerCase().includes(q))
      ),
    [activeCategory, q]
  );

  const filteredCollections = useMemo(
    () =>
      collections.filter(
        (c) =>
          (activeCategory === "ALL" || c.category === activeCategory) &&
          (!q || c.name.toLowerCase().includes(q))
      ),
    [activeCategory, q]
  );

  const visibleSellers = showAllSellers ? sellers : sellers.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/20 border border-transparent"
                  : "text-slate-400 border border-indigo-900/40 hover:text-white hover:border-cyan-500/30 hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-2 bg-[#080818] border border-indigo-900/40 rounded-xl px-3 py-2 focus-within:border-cyan-500/40 transition-colors">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={view === "NFTs" ? "Search NFTs..." : "Search collections..."}
              className="bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 w-32"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-600 hover:text-white text-xs transition-colors">✕</button>
            )}
          </div>

          
          <div className="flex gap-0.5 bg-[#080818] rounded-xl p-1 border border-indigo-900/40">
            {(["NFTs", "Collections"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  view === v
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-600/20 border border-indigo-700/50 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6">
        {view === "NFTs" ? (
          filteredNfts.length === 0 ? (
            <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-12 text-center text-slate-600 text-sm">
              No NFTs match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredNfts.map((nft) => (
                <NFTCard key={nft.id} nft={nft} now={now} onBid={setBidding} />
              ))}
            </div>
          )
        ) : filteredCollections.length === 0 ? (
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-12 text-center text-slate-600 text-sm">
            No collections match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollections.map((col) => (
              <CollectionCard key={col.id} col={col} />
            ))}
          </div>
        )}

        
        <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-5 h-fit">
          <div className="flex items-center justify-between mb-5">
            <span className="text-slate-100 font-bold text-sm">Top Sellers</span>
            <button
              onClick={() => setShowAllSellers((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors group/all"
            >
              {showAllSellers ? "Show less" : "See All"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                className={`transition-transform ${showAllSellers ? "rotate-90" : "group-hover/all:translate-x-0.5"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col divide-y divide-indigo-900/30">
            {visibleSellers.map((s, i) => (
              <div key={s.handle} className="flex items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-slate-600 text-[10px] font-bold w-4 shrink-0 text-right">{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ring-1 ring-indigo-700/40 ring-offset-1 ring-offset-[#0c0c24]"
                    style={{ background: avatarColors[i % avatarColors.length] }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-200 text-xs font-semibold truncate">{s.name}</div>
                    <div className="text-slate-600 text-[10px] truncate">{s.handle}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(i)}
                  className={`shrink-0 text-[11px] font-semibold px-3 py-1 rounded-lg transition-all duration-200 ${
                    following[i]
                      ? "bg-indigo-950 border border-indigo-800/50 text-slate-400 hover:border-red-800/50 hover:text-red-400 hover:bg-red-950/20"
                      : "bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:shadow-md hover:shadow-cyan-500/25 hover:opacity-90"
                  }`}
                >
                  {following[i] ? "Following" : "+ Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bidding && <BidModal nft={bidding} onClose={() => setBidding(null)} />}
    </div>
  );
}
