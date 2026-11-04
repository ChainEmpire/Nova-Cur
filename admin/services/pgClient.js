const auth = require('../auth-helper');
const { requestPg } = require('./httpClient');

async function pgFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const method = (options.method || 'GET').toUpperCase();

  return requestPg({
    url: normalizedPath,
    method,
    headers: options.headers,
    data: options.body ? JSON.parse(options.body) : undefined,
  });
}

async function verifyUserToken(token) {
  if (!token) return { ok: false, reason: 'No token provided.' };

  const storage = {
    getItem: (key) => {
      if (key === 'pg_token') return token;
      return null;
    },
    setItem: () => undefined,
    removeItem: () => undefined,
  };

  return auth.verifyTokenWithApi(storage);
}

async function loginUser(email, password) {
  if (auth.matchesDemoAccount(email, password)) {
    return {
      ok: true,
      data: {
        token: auth.DEMO_ACCOUNT.token,
        user: {
          id: 1,
          email: auth.DEMO_ACCOUNT.email,
          username: auth.DEMO_ACCOUNT.username,
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  const result = await pgFetch('/api/pg/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.ok && result.data?.success) {
    return { ok: true, data: result.data.data };
  }

  return { ok: false, reason: result.data?.msg || result.error || 'Login failed.' };
}

async function getUserProfile(token) {
  const result = await pgFetch('/api/pg/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.ok && result.data?.success) {
    return { ok: true, user: result.data.data };
  }

  return { ok: false, reason: result.data?.msg || result.error || 'Unable to fetch profile.' };
}

async function getUserTransactions(token) {
  const result = await pgFetch('/api/pg/transactions', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.ok && result.data?.success) {
    return { ok: true, transactions: result.data.data || [] };
  }

  return { ok: false, transactions: [], reason: result.data?.msg || result.error };
}

async function getDemoTransactions() {
  return getUserTransactions(auth.DEMO_ACCOUNT.token);
}

async function pingApi() {
  const result = await pgFetch('/api/pg/auth/me', {
    headers: { Authorization: `Bearer ${auth.DEMO_ACCOUNT.token}` },
  });
  return { ok: result.ok, status: result.status };
}

module.exports = {
  pgFetch,
  verifyUserToken,
  loginUser,
  getUserProfile,
  getUserTransactions,
  getDemoTransactions,
  pingApi,
};
