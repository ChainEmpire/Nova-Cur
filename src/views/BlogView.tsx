import React, { useState, useEffect, useCallback } from "react";
import {
  pgGetBlogPosts,
  pgGetBlogPost,
  clearSession,
  getStoredUser,
  BlogPost,
  PgUser,
} from "../services/pg.api.service";
import AuthModal from "../components/auth/AuthModal";

const PAGE_SIZE = 10;

const sidebarCategories = [
  { icon: "🆕", label: "All", value: "" },
  { icon: "📈", label: "Market", value: "Market" },
  { icon: "⚙️", label: "Technology", value: "Technology" },
  { icon: "🏦", label: "DeFi", value: "DeFi" },
  { icon: "🖼️", label: "NFT", value: "NFT" },
  { icon: "⚖️", label: "Regulation", value: "Regulation" },
  { icon: "📚", label: "Education", value: "Education" },
];

const meetups = [
  { month: "JUL", day: "12", title: "DeFi Summit 2026 – Buenos Aires", tags: ["In-person", "Free"] },
  { month: "JUL", day: "18", title: "Blockchain Dev Meetup Online", tags: ["Remote", "Free"] },
  { month: "AUG", day: "3", title: "NFT & Web3 Expo – Medellín", tags: ["In-person", "Paid"] },
];

const podcasts = [
  "Bitcoin: The Future of Money with Nic Carter",
  "DeFi Explained for Beginners – Bankless",
  "Ethereum Layer 2: Everything You Need to Know",
  "How to Survive the Bear Market – The Crypto Mind",
  "NFTs and the New Digital Economy – Metaverse Today",
  "Crypto Security: Protect Your Assets – CryptoSec",
];

const avatarColors = ["#e84141", "#f7931a", "#00d4b5", "#5b9cf6", "#a855f7"];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};



function PostModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    pgGetBlogPost(postId)
      .then((res) => {
        if (res.success) setPost(res.data);
        else setError(res.msg || "Post not found");
      })
      .catch(() => setError("Connection error"))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-[#080818] border border-indigo-900/50 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-[#080818]/95 backdrop-blur border-b border-indigo-900/40">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Article</span>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all">✕</button>
        </div>

        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            <div className="h-6 w-3/4 bg-indigo-900/20 animate-pulse rounded" />
            <div className="h-40 w-full bg-indigo-900/20 animate-pulse rounded-xl" />
            <div className="h-3 w-full bg-indigo-900/20 animate-pulse rounded" />
            <div className="h-3 w-5/6 bg-indigo-900/20 animate-pulse rounded" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-slate-500 text-sm">{error}</div>
        ) : post && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-full">
                {post.category}
              </span>
              <span className="text-slate-600 text-xs">{timeAgo(post.created_at)}</span>
            </div>
            <h1 className="text-slate-100 font-bold text-xl leading-snug mb-4">{post.title}</h1>
            {post.image_url && (
              <div className="rounded-xl overflow-hidden mb-5 bg-indigo-900/20">
                <img src={post.image_url} alt={post.title} className="w-full max-h-72 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                />
              </div>
            )}
            <p className="text-slate-400 text-sm leading-7 whitespace-pre-line mb-5">{post.content}</p>
            <div className="flex gap-1.5 mb-5 flex-wrap">
              {(post.tags || []).map((tag) => (
                <span key={tag} className="bg-indigo-900/30 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-indigo-900/40">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-indigo-900/30">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ background: avatarColors[post.id % avatarColors.length] }}
              >
                {post.author[0]}
              </div>
              <span className="text-slate-300 text-sm font-medium">{post.author}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default function BlogView() {
  const [activeCategory, setActiveCategory] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [user, setUser] = useState<PgUser | null>(getStoredUser());
  const [showAuth, setShowAuth] = useState(false);
  const [openPost, setOpenPost] = useState<number | null>(null);

  const loadPosts = useCallback((category: string, offset: number, append: boolean) => {
    (append ? setLoadingMore : setLoading)(true);
    pgGetBlogPosts(PAGE_SIZE, offset, category)
      .then((res) => {
        if (res.success) {
          setPosts((prev) => (append ? [...prev, ...res.data] : res.data));
          setTotal(res.total ?? res.data.length);
        }
      })
      .catch(() => {})
      .finally(() => (append ? setLoadingMore : setLoading)(false));
  }, []);

  useEffect(() => {
    loadPosts(activeCategory, 0, false);
  }, [activeCategory, loadPosts]);

  const hasMore = posts.length < total;

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6">
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={(u) => setUser(u)} />
      )}
      {openPost !== null && (
        <PostModal postId={openPost} onClose={() => setOpenPost(null)} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_220px] gap-6">
        
        <div className="flex flex-col gap-4">
          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.username?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-100 text-sm font-semibold truncate">{user.username}</div>
                    <div className="text-slate-500 text-xs truncate">{user.email}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-slate-600 hover:text-cyan-400 text-xs text-left transition-colors">
                  Sign out →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-slate-200 text-sm font-semibold mb-1">Your account</div>
                <p className="text-slate-500 text-xs">Sign in to save favorite coins and track your swaps.</p>
                <button onClick={() => setShowAuth(true)}
                  className="mt-2 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Start trading
                </button>
              </div>
            )}
          </div>

          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-4 flex flex-col gap-0.5">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Categories</div>
            {sidebarCategories.map((c) => (
              <button key={c.value} onClick={() => setActiveCategory(c.value)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all ${
                  activeCategory === c.value
                    ? "bg-indigo-950 border border-indigo-700/50 text-white"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/3"
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-slate-100 font-bold text-lg">{activeCategory || "All posts"}</h2>
            <span className="text-slate-600 text-xs">{loading ? "…" : `${total} articles`}</span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-5">
                <div className="flex gap-4">
                  <div className="w-28 h-24 rounded-xl bg-indigo-900/20 animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="h-5 w-3/4 bg-indigo-900/20 animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-indigo-900/20 animate-pulse rounded" />
                    <div className="h-3 w-full bg-indigo-900/20 animate-pulse rounded" />
                    <div className="h-3 w-4/5 bg-indigo-900/20 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-8 text-center text-slate-600">
              No posts in this category yet.
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setOpenPost(post.id)}
                  className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-5 hover:border-indigo-700/50 hover:bg-indigo-950/30 transition-all text-left"
                >
                  <div className="flex gap-4">
                    {post.image_url && (
                      <div className="flex-shrink-0 w-28 h-24 rounded-xl overflow-hidden bg-indigo-900/20">
                        <img src={post.image_url} alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                      </div>
                      <div className="text-slate-100 font-semibold text-sm leading-snug mb-2">
                        {post.title}
                      </div>
                      <p className="text-slate-500 text-xs leading-5 line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        {(post.tags || []).map((tag) => (
                          <span key={tag} className="bg-indigo-900/30 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-indigo-900/40">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                          style={{ background: avatarColors[post.id % avatarColors.length] }}
                        >
                          {post.author[0]}
                        </div>
                        <span className="text-slate-300 text-xs font-medium">{post.author}</span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-slate-500 text-xs">{timeAgo(post.created_at)}</span>
                        <span className="text-cyan-400/70 text-xs ml-auto">Read more →</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {hasMore && (
                <button
                  onClick={() => loadPosts(activeCategory, posts.length, true)}
                  disabled={loadingMore}
                  className="py-3 rounded-xl border border-indigo-800/50 text-slate-400 text-sm font-semibold hover:text-white hover:border-cyan-500/40 hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : `Load more (${total - posts.length} remaining)`}
                </button>
              )}
            </>
          )}
        </div>

        
        <div className="flex flex-col gap-4">
          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-4">
            <div className="mb-3">
              <span className="text-slate-200 font-bold text-sm">Events</span>
            </div>
            {meetups.map((m, i) => (
              <div key={i} className={`flex gap-3 ${i < meetups.length - 1 ? "mb-3 pb-3 border-b border-indigo-900/30" : ""}`}>
                <div className="text-center min-w-[32px] bg-indigo-950/50 rounded-lg px-1 py-1.5 border border-indigo-900/40">
                  <div className="text-slate-600 text-[9px] uppercase font-semibold">{m.month}</div>
                  <div className="text-slate-200 font-bold text-sm leading-none">{m.day}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-slate-300 text-xs font-medium leading-tight mb-1.5 line-clamp-2">{m.title}</div>
                  <div className="flex gap-1 flex-wrap">
                    {m.tags.map((tag) => (
                      <span key={tag} className="bg-indigo-900/30 text-slate-500 text-[9px] px-1.5 py-0.5 rounded border border-indigo-900/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          
          <div className="rounded-2xl border border-indigo-900/40 bg-[#0c0c24] p-4">
            <div className="mb-3">
              <span className="text-slate-200 font-bold text-sm">Podcasts</span>
            </div>
            {podcasts.map((p, i) => (
              <div key={i} className={`flex items-center gap-2.5 ${i < podcasts.length - 1 ? "mb-3" : ""}`}>
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: avatarColors[i % avatarColors.length] }}
                >
                  ▶
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-400 text-[10px] leading-tight line-clamp-2">{p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
