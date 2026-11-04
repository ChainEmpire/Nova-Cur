const express = require('express');
const liquidityService = require('../services/liquidityService');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAdmin('liquidity:read'), async (req, res) => {
  try {
    const summary = await liquidityService.getLiquiditySummary();
    res.json({ ok: true, summary });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load liquidity summary.' });
  }
});

router.get('/pools', requireAdmin('liquidity:read'), async (req, res) => {
  try {
    const pools = await liquidityService.getPools();
    res.json({ ok: true, pools });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load pools.' });
  }
});

router.get('/pools/:pair', requireAdmin('liquidity:read'), async (req, res) => {
  try {
    const pair = decodeURIComponent(req.params.pair);
    const pool = await liquidityService.getPool(pair);
    if (!pool) {
      return res.status(404).json({ ok: false, message: 'Pool not found.' });
    }
    return res.json({ ok: true, pool });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load pool.' });
  }
});

router.get('/events', requireAdmin('liquidity:read'), (req, res) => {
  const limit = Number(req.query.limit) || 25;
  res.json({ ok: true, events: liquidityService.getLiquidityEvents(limit) });
});

router.get('/risky', requireAdmin('liquidity:read'), async (req, res) => {
  try {
    const pools = await liquidityService.getRiskyPools();
    res.json({ ok: true, pools });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Failed to load risky pools.' });
  }
});

module.exports = router;
