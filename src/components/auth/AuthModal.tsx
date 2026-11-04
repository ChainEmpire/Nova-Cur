import React, { useState } from "react";
import { pgLogin, pgRegister, saveSession, PgUser } from "../../services/pg.api.service";

export default function AuthModal({
  onClose,
  onAuth,
}: {
  onClose: () => void;
  onAuth: (user: PgUser) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await pgLogin(email, password)
        : await pgRegister(email, password, username);
      if (res.success) {
        saveSession(res.data.token, res.data.user);
        onAuth(res.data.user);
        onClose();
      } else {
        setError(res.msg || "Unknown error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#080818] border border-indigo-900/50 rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-slate-100 font-bold text-xl">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all text-lg">✕</button>
        </div>
        <div className="flex gap-1 mb-6 bg-[#0c0c24] rounded-xl p-1 border border-indigo-900/40">
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? "bg-indigo-950 border border-indigo-700/50 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "register" && (
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-4 py-3 text-slate-100 text-sm outline-none placeholder-slate-600 focus:border-cyan-500/50 transition-all"
            />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-4 py-3 text-slate-100 text-sm outline-none placeholder-slate-600 focus:border-cyan-500/50 transition-all"
          />
          <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="bg-[#0c0c24] border border-indigo-900/40 rounded-xl px-4 py-3 text-slate-100 text-sm outline-none placeholder-slate-600 focus:border-cyan-500/50 transition-all"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/15"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
