const crypto = require('crypto');
const { findAdminById, hasPermission } = require('../config/adminAccounts');

const sessions = new Map();

function createToken() {
  return `admin-token-${crypto.randomBytes(24).toString('hex')}`;
}

function createSession(admin) {
  const token = createToken();
  const session = {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    createdAt: new Date().toISOString(),
  };

  sessions.set(token, session);
  return session;
}

function getSession(token) {
  if (!token) return null;
  return sessions.get(token) || null;
}

function destroySession(token) {
  if (!token) return;
  sessions.delete(token);
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  if (req.query?.token) {
    return String(req.query.token);
  }

  return null;
}

function requireAdmin(requiredPermission) {
  return (req, res, next) => {
    const token = extractToken(req);
    const session = getSession(token);

    if (!session) {
      return res.status(401).json({ ok: false, message: 'Admin authentication required.' });
    }

    const admin = findAdminById(session.admin.id);
    if (!admin) {
      destroySession(token);
      return res.status(401).json({ ok: false, message: 'Invalid admin session.' });
    }

    if (requiredPermission && !hasPermission(session.admin.role, requiredPermission)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions.' });
    }

    req.adminSession = session;
    req.admin = session.admin;
    next();
  };
}

function optionalAdmin(req, res, next) {
  const token = extractToken(req);
  const session = getSession(token);
  if (session) {
    req.adminSession = session;
    req.admin = session.admin;
  }
  next();
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  extractToken,
  requireAdmin,
  optionalAdmin,
};
