const fs = require('fs');
const path = require('path');

const AUDIT_LOG_PATH = path.join(__dirname, '..', 'data', 'audit-log.json');

function readAuditLog() {
  try {
    const raw = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAuditLog(entries) {
  fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_LOG_PATH, JSON.stringify(entries, null, 2));
}

function appendAuditEntry(entry) {
  const entries = readAuditLog();
  entries.unshift({
    id: entries.length + 1,
    at: new Date().toISOString(),
    ...entry,
  });
  writeAuditLog(entries.slice(0, 500));
}

function auditMutations(actionLabel) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (payload) => {
      if (req.method !== 'GET' && req.admin) {
        appendAuditEntry({
          action: actionLabel,
          method: req.method,
          path: req.originalUrl,
          adminId: req.admin.id,
          adminEmail: req.admin.email,
          role: req.admin.role,
          ok: payload?.ok !== false,
          details: payload?.message || null,
        });
      }

      return originalJson(payload);
    };

    next();
  };
}

function getAuditLog(limit = 50) {
  return readAuditLog().slice(0, limit);
}

module.exports = {
  appendAuditEntry,
  auditMutations,
  getAuditLog,
};
