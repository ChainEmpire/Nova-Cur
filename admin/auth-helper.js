const { Buffer } = require('buffer');

const STORAGE_KEYS = {
  token: 'pg_token',
  user: 'pg_user',
};

const DEMO_ACCOUNT = {
  email: 'nova@demo.com',
  password: 'nova2026',
  username: 'nova',
  token: 'demo-token-nova-2026',
};

function matchesDemoAccount(email, password) {
  return String(email || '').trim().toLowerCase() === DEMO_ACCOUNT.email && String(password || '') === DEMO_ACCOUNT.password;
}

function isDemoSession(session) {
  if (!session || !session.token) return false;

  const tokenMatches = session.token === DEMO_ACCOUNT.token;
  const emailMatches = session.user && String(session.user.email || '').trim().toLowerCase() === DEMO_ACCOUNT.email;
  const usernameMatches = !session.user || String(session.user.username || '').trim().toLowerCase() === DEMO_ACCOUNT.username;

  return tokenMatches && (emailMatches || usernameMatches);
}

const BASE_URL = (() => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
    return String(process.env.REACT_APP_API_URL).replace(/\/$/, '');
  }
  return 'http://localhost:1357';
})();

function readStorageItem(storage, key) {
  if (!storage) return null;
  try {
    return storage.getItem(STORAGE_KEYS[key]) || null;
  } catch {
    return null;
  }
}

function writeStorageItem(storage, key, value) {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS[key], value);
  } catch {

  }
}

function removeStorageItem(storage, key) {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS[key]);
  } catch {

  }
}

async function sha256(value) {
  const text = typeof value === 'string' ? value : String(value);

  try {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  } catch {
    return Buffer.from(text, 'utf8').toString('hex');
  }
}

function validateCredentials(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return {
      ok: false,
      message: 'Email and password are required.',
    };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      ok: false,
      message: 'Please enter a valid email address.',
    };
  }

  if (trimmedPassword.length < 6) {
    return {
      ok: false,
      message: 'Password must be at least 6 characters long.',
    };
  }

  if (matchesDemoAccount(trimmedEmail, trimmedPassword)) {
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

function getSession(storage) {
  try {
    const token = readStorageItem(storage, 'token');
    const user = readStorageItem(storage, 'user');
    if (!token) return null;
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return null;
  }
}

function isLoggedIn(storage) {
  return Boolean(getSession(storage));
}

function clearSession(storage) {
  removeStorageItem(storage, 'token');
  removeStorageItem(storage, 'user');
}

async function verifyTokenWithApi(storage) {
  const session = getSession(storage);
  if (!session || !session.token) {
    return { ok: false, reason: 'No active session.' };
  }

  if (isDemoSession(session)) {
    return {
      ok: true,
      user: session.user || {
        id: 1,
        email: DEMO_ACCOUNT.email,
        username: DEMO_ACCOUNT.username,
        created_at: new Date().toISOString(),
      },
      session,
    };
  }

  try {
    const { requestPg } = require('./services/httpClient');
    const result = await requestPg({
      url: '/api/pg/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${session.token}` },
    });

    if (result.ok && result.data?.success) {
      return { ok: true, user: result.data.data || session.user, session };
    }

    return { ok: false, reason: result.data?.msg || 'Session invalid.' };
  } catch (error) {
    return { ok: false, reason: error?.message || 'Network error.' };
  }
}

module.exports = {
  STORAGE_KEYS,
  BASE_URL,
  DEMO_ACCOUNT,
  matchesDemoAccount,
  isDemoSession,
  sha256,
  validateCredentials,
  getSession,
  isLoggedIn,
  clearSession,
  verifyTokenWithApi,
};
