const express = require('express');
const tradingService = require('../services/tradingService');
const { requireAdmin } = require('../middleware/auth');
const { auditMutations } = require('../middleware/audit');

const router = express.Router();

router.get('/summary', requireAdmin('trading:read'), (req, res) => {
  res.json({ ok: true, summary: tradingService.getTradingSummary() });
});

router.get('/trades', requireAdmin('trading:read'), (req, res) => {
  const trades = tradingService.getTrades({
    pair: req.query.pair,
    status: req.query.status,
  });
  res.json({ ok: true, trades });
});

router.get('/pairs', requireAdmin('trading:read'), (req, res) => {
  res.json({ ok: true, pairs: tradingService.getPairs() });
});

router.patch('/pairs/:pair', requireAdmin('trading:write'), auditMutations('pair_update'), (req, res) => {
  const pair = decodeURIComponent(req.params.pair);
  const result = tradingService.updatePair(pair, req.body || {});
  res.status(result.ok ? 200 : 404).json(result);
});

router.get('/anomalies', requireAdmin('trading:read'), (req, res) => {
  res.json({ ok: true, anomalies: tradingService.getAnomalies() });
});

module.exports = router;
