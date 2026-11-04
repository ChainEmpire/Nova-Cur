import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { pgLogin, pgRegister, saveSession } from "../src/services/pg.api.service";
import { redirectIfAuthenticated, validateCredentials } from "../src/utils/clientAuth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    void redirectIfAuthenticated(router);
  }, [router.asPath]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (typeof window === "undefined") return;

    try {
      const validation = validateCredentials(email, password);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }

      setLoading(true);

      const response = mode === "login"
        ? await pgLogin(validation.email, validation.password)
        : await pgRegister(validation.email, validation.password, username || undefined);

      if (!response || !response.success) {
        setError(response?.msg || "Login failed. Please try again.");
        return;
      }

      saveSession(response.data.token, response.data.user);
      router.push("/swap");
    } catch (err: any) {
      setError(err?.message || "Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[#070914] relative">
      <div className="w-full max-w-md rounded-3xl border border-indigo-900/50 bg-[#0b0d1a]/90 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur-sm">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">novaFi</p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
        </div>

        <div className="mb-6 flex rounded-2xl bg-[#10162b] p-1 border border-indigo-900/40">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === item
                  ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-indigo-900/50 bg-[#0f1528] px-4 py-3 text-white placeholder:text-slate-500 outline-none ring-0 focus:border-cyan-500/70"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-indigo-900/50 bg-[#0f1528] px-4 py-3 text-white placeholder:text-slate-500 outline-none ring-0 focus:border-cyan-500/70"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-indigo-900/50 bg-[#0f1528] px-4 py-3 text-white placeholder:text-slate-500 outline-none ring-0 focus:border-cyan-500/70"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-cyan-400 hover:text-cyan-300"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
