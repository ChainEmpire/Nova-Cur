import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { adminLogin, saveAdminSession } from "../../src/admin/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@novafi.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminLogin(email, password);
      if (!result.ok || !result.token) {
        setError(result.message || "Login failed.");
        return;
      }

      saveAdminSession(result.token);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070914] px-4">
      <div className="w-full max-w-md rounded-3xl border border-indigo-900/50 bg-[#0b0d1a]/90 p-8 shadow-2xl shadow-indigo-950/30">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">NovaFi Admin</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Operations Console</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with an admin account to inspect platform activity.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@novafi.app"
            className="w-full rounded-xl border border-indigo-900/50 bg-[#0f1528] px-4 py-3 text-white outline-none focus:border-cyan-500/70"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-indigo-900/50 bg-[#0f1528] px-4 py-3 text-white outline-none focus:border-cyan-500/70"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          Demo: admin@novafi.app / admin2026
        </p>
      </div>
    </div>
  );
}
