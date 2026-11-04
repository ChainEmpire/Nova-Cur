const BASE = `${process.env.REACT_APP_API_URL ?? "http://localhost:1357"}/api/pg`;

type StorageKey = "token" | "user";

const DEMO_EMAIL = "nova@demo.com";
const DEMO_PASSWORD = "nova2026";

const STORAGE_KEYS: Record<StorageKey, string> = {
  token: "pg_token",
  user: "pg_user",
};

function isDemoCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readStorageItem(key: StorageKey): string | null {
  const storage = getStorage();

  try {
    if (storage) {
      const v = storage.getItem(STORAGE_KEYS[key]);
      if (v) return v;
    }
  } catch {

  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const v = window.localStorage.getItem(STORAGE_KEYS[key]);
      if (v) {

        try {
          if (storage) {
            storage.setItem(STORAGE_KEYS[key], v);
            window.localStorage.removeItem(STORAGE_KEYS[key]);
          }
        } catch {

        }
        return v;
      }
    }
  } catch {

  }

  return null;
}

function writeStorageItem(key: StorageKey, value: string) {
  const storage = getStorage();
  if (storage) {
    try { storage.setItem(STORAGE_KEYS[key], value); } catch {}
  } else {

    try { if (typeof window !== "undefined" && window.localStorage) window.localStorage.setItem(STORAGE_KEYS[key], value); } catch {}
  }
}

function removeStorageItem(key: StorageKey) {
  const storage = getStorage();
  try { if (storage) storage.removeItem(STORAGE_KEYS[key]); } catch {}
  try { if (typeof window !== "undefined" && window.localStorage) window.localStorage.removeItem(STORAGE_KEYS[key]); } catch {}
}

function authHeaders() {
  const token = readStorageItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PgUser {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  wallet_address?: string;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  tags: string[];
  image_url: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  type: "swap" | "buy" | "sell" | "transfer";
  coin_id: string;
  coin_symbol: string;
  amount_usd: number;
  amount_coin: number;
  tx_hash?: string;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
}

export interface Favorite {
  id: number;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  added_at: string;
}


export async function pgRegister(email: string, password: string, username?: string) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  return res.json();
}

export async function pgLogin(email: string, password: string) {
  if (isDemoCredentials(email, password)) {
    return {
      success: true,
      msg: "Demo login successful.",
      data: {
        token: "demo-token-nova-2026",
        user: {
          id: 1,
          email: DEMO_EMAIL,
          username: "nova",
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function pgMe(): Promise<{ success: boolean; data?: PgUser }> {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() as HeadersInit });
  return res.json();
}


export async function pgGetBlogPosts(
  limit = 10,
  offset = 0,
  category = ""
): Promise<{ success: boolean; data: BlogPost[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (category) params.set("category", category);
  const res = await fetch(`${BASE}/blog?${params}`);
  return res.json();
}

export async function pgGetBlogPost(id: number): Promise<{ success: boolean; data: BlogPost; msg?: string }> {
  const res = await fetch(`${BASE}/blog/${id}`);
  return res.json();
}


export async function pgGetTransactions(): Promise<{ success: boolean; data: Transaction[] }> {
  const res = await fetch(`${BASE}/transactions`, { headers: authHeaders() as HeadersInit });
  return res.json();
}

export async function pgCreateTransaction(data: Omit<Transaction, "id" | "status" | "created_at">) {
  const res = await fetch(`${BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify(data),
  });
  return res.json();
}


export async function pgGetFavorites(): Promise<{ success: boolean; data: Favorite[] }> {
  const res = await fetch(`${BASE}/favorites`, { headers: authHeaders() as HeadersInit });
  return res.json();
}

export async function pgAddFavorite(coin_id: string, coin_name: string, coin_symbol: string) {
  const res = await fetch(`${BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() } as HeadersInit,
    body: JSON.stringify({ coin_id, coin_name, coin_symbol }),
  });
  return res.json();
}

export async function pgRemoveFavorite(coinId: string) {
  const res = await fetch(`${BASE}/favorites/${coinId}`, {
    method: "DELETE",
    headers: authHeaders() as HeadersInit,
  });
  return res.json();
}


export function getStoredUser(): PgUser | null {
  try {
    const u = readStorageItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: PgUser) {
  writeStorageItem("token", token);
  writeStorageItem("user", JSON.stringify(user));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("novafi-auth-changed", { detail: { loggedIn: true } }));
  }
}

export function clearSession() {
  removeStorageItem("token");
  removeStorageItem("user");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("novafi-auth-changed", { detail: { loggedIn: false } }));
  }
}
