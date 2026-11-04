const crypto = require('crypto');
const { findAdminAccount, ROLE_PERMISSIONS } = require('../config/adminAccounts');
const { createSession, destroySession, getSession, extractToken } = require('../middleware/auth');
const { appendAuditEntry, getAuditLog } = require('../middleware/audit');

function login(email, password) {
  const account = findAdminAccount(email, password);
  if (!account) {
    return { ok: false, message: 'Invalid admin credentials.' };
  }

  const session = createSession(account);
  appendAuditEntry({
    action: 'admin_login',
    adminId: account.id,
    adminEmail: account.email,
    role: account.role,
    ok: true,
  });

  return {
    ok: true,
    token: session.token,
    admin: session.admin,
  };
}

function logout(token) {
  const session = getSession(token);
  if (session) {
    appendAuditEntry({
      action: 'admin_logout',
      adminId: session.admin.id,
      adminEmail: session.admin.email,
      role: session.admin.role,
      ok: true,
    });
  }

  destroySession(token);
  return { ok: true, message: 'Logged out.' };
}

function me(token) {
  const session = getSession(token);
  if (!session) {
    return { ok: false, message: 'Not authenticated.' };
  }

  return {
    ok: true,
    admin: session.admin,
    permissions: ROLE_PERMISSIONS[session.admin.role] || [],
  };
}

function checkUserSession(token) {
  const auth = require('../auth-helper');
  const storage = token
    ? {
        getItem: (key) => (key === 'pg_token' ? token : null),
        setItem: () => undefined,
        removeItem: () => undefined,
      }
    : null;

  if (!storage) {
    return { ok: false, reason: 'No token provided.' };
  }

  return auth.verifyTokenWithApi(storage);
}

module.exports = {
  login,
  logout,
  me,
  getAuditLog,
  checkUserSession,
};
