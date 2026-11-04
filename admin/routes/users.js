const express = require('express');
const userService = require('../services/userService');
const { requireAdmin } = require('../middleware/auth');
const { auditMutations } = require('../middleware/audit');

const router = express.Router();

router.get('/', requireAdmin('users:read'), async (req, res) => {
  try {
    const users = await userService.getUsersWithPgData();
    res.json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load users.' });
  }
});

router.get('/wallets/:address/activity', requireAdmin('activity:read'), async (req, res) => {
  const result = await userService.getWalletActivity(req.params.address);
  res.json(result);
});

router.get('/:id/activity', requireAdmin('activity:read'), async (req, res) => {
  const result = await userService.getUserActivity(req.params.id);
  res.status(result.ok ? 200 : 404).json(result);
});

router.patch('/:id/status', requireAdmin('users:write'), auditMutations('user_status_update'), (req, res) => {
  const result = userService.updateUserStatus(req.params.id, req.body?.status);
  res.status(result.ok ? 200 : 400).json(result);
});

module.exports = router;
