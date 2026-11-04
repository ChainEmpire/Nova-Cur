const express = require('express');
const authService = require('../services/authService');
const { requireAdmin, extractToken } = require('../middleware/auth');
const { auditMutations } = require('../middleware/audit');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const result = authService.login(email, password);
  res.status(result.ok ? 200 : 401).json(result);
});

router.post('/logout', requireAdmin(), auditMutations('admin_logout'), (req, res) => {
  const token = extractToken(req);
  res.json(authService.logout(token));
});

router.get('/me', requireAdmin(), (req, res) => {
  const token = extractToken(req);
  res.json(authService.me(token));
});

router.get('/session-check', async (req, res) => {
  const token = req.query.token;
  const result = await authService.checkUserSession(token);
  res.status(result.ok ? 200 : 401).json(result);
});

router.get('/audit-log', requireAdmin('auth:audit'), (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json({ ok: true, entries: authService.getAuditLog(limit) });
});

module.exports = router;
