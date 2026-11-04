export const STORAGE_KEYS = {
  token: "pg_token",
  user: "pg_user",
} as const;

export const DEMO_ACCOUNT = {
  email: "nova@demo.com",
  password: "nova2026",
  username: "nova",
  token: "demo-token-nova-2026",
};

export type AuthSession = {
  token: string;
  user: Record<string, any> | null;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage || window.localStorage;
  } catch {
    return null;
  }
}

function readStorageItem(key: keyof typeof STORAGE_KEYS): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(STORAGE_KEYS[key]) || null;
  } catch {
    return null;
  }
}

function writeStorageItem(key: keyof typeof STORAGE_KEYS, value: string) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS[key], value);
  } catch {

  }
}

function removeStorageItem(key: keyof typeof STORAGE_KEYS) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEYS[key]);
  } catch {

  }
}

export function getSession(): AuthSession | null {
  try {
    const token = readStorageItem("token");
    const user = readStorageItem("user");

    if (!token) return null;

    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getSession());
}

export function clearSession() {
  removeStorageItem("token");
  removeStorageItem("user");

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("novafi-auth-changed", { detail: { loggedIn: false } }));
  }
}

export function saveSession(token: string, user: Record<string, any>) {
  writeStorageItem("token", token);
  writeStorageItem("user", JSON.stringify(user));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("novafi-auth-changed", { detail: { loggedIn: true } }));
  }
}

type ValidationResult =
  | { ok: true; email: string; password: string; demo?: boolean }
  | { ok: false; message: string };

export function validateCredentials(email: string, password: string): ValidationResult {
  if (typeof email !== "string" || typeof password !== "string") {
    return {
      ok: false,
      message: "Email and password are required.",
    };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      ok: false,
      message: "Please enter a valid email address.",
    };
  }

  if (trimmedPassword.length < 6) {
    return {
      ok: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  if (trimmedEmail.toLowerCase() === DEMO_ACCOUNT.email && trimmedPassword === DEMO_ACCOUNT.password) {
    return {
      ok: true,
      email: trimmedEmail,
      password: trimmedPassword,
      demo: true,
    };
  }

  return {
    ok: true,
    email: trimmedEmail,
    password: trimmedPassword,
  };
}

export async function redirectIfAuthenticated(router?: { push: (url: string) => unknown }) {
  if (typeof window === "undefined") return false;

  const session = getSession();
  if (!session || !session.token) return false;

  if (router && typeof router.push === "function") {
    router.push("/swap");
    return true;
  }

  window.location.href = "/swap";
  return true;
}
