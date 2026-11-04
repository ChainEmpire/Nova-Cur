const express = require('express');
const activityService = require('../services/activityService');
const chainIndexer = require('../services/chainIndexer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAdmin('activity:read'), async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const data = await activityService.getRecentActivity(limit);
    res.json({ ok: true, ...data });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load activity.' });
  }
});

router.get('/alerts', requireAdmin('activity:read'), (req, res) => {
  res.json({ ok: true, alerts: activityService.getAlerts() });
});

router.get('/chains', requireAdmin('activity:read'), async (req, res) => {
  try {
    const chains = await chainIndexer.getChainStatus();
    res.json({ ok: true, chains });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load chain status.' });
  }
});

router.get('/indexer', requireAdmin('activity:read'), async (req, res) => {
  try {
    const indexer = await chainIndexer.getIndexerHealth();
    res.json({ ok: true, indexer });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load indexer health.' });
  }
});

module.exports = router;
