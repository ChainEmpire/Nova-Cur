const express = require('express');
const statsService = require('../services/statsService');
const healthService = require('../services/healthService');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', requireAdmin('overview:read'), async (req, res) => {
  try {
    const stats = await statsService.getOverviewStats();
    res.json({ ok: true, stats });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load stats.' });
  }
});

router.get('/health', requireAdmin('stats:read'), async (req, res) => {
  try {
    const health = await healthService.getPlatformHealth();
    res.json({ ok: true, health });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load platform health.' });
  }
});

router.get('/trading', requireAdmin('stats:read'), (req, res) => {
  res.json({ ok: true, stats: statsService.getTradingStats(req.query.period || '24h') });
});

router.get('/liquidity', requireAdmin('stats:read'), async (req, res) => {
  try {
    const stats = await statsService.getLiquidityStats(req.query.period || '24h');
    res.json({ ok: true, stats });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load liquidity stats.' });
  }
});

router.get('/users', requireAdmin('stats:read'), (req, res) => {
  res.json({ ok: true, stats: statsService.getUserStats(req.query.period || '24h') });
});

router.get('/export', requireAdmin('stats:read'), async (req, res) => {
  try {
    const snapshot = await statsService.exportSnapshot();
    res.json({ ok: true, snapshot });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to export snapshot.' });
  }
});

module.exports = router;
