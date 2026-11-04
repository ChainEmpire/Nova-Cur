const express = require('express');
const contractService = require('../services/contractService');
const { requireAdmin } = require('../middleware/auth');
const { auditMutations } = require('../middleware/audit');

const router = express.Router();

router.get('/', requireAdmin('contracts:read'), (req, res) => {
  const contracts = contractService.getContracts({
    status: req.query.status,
    chainId: req.query.chainId,
    type: req.query.type,
  });
  res.json({ ok: true, contracts });
});

router.get('/changelog', requireAdmin('contracts:read'), (req, res) => {
  res.json({ ok: true, changelog: contractService.getChangelog() });
});

router.post('/sync', requireAdmin('contracts:write'), auditMutations('contract_sync'), (req, res) => {
  const result = contractService.syncToMainApp(req.admin);
  res.status(result.ok ? 200 : 400).json(result);
});

router.post('/:address/verify', requireAdmin('contracts:write'), auditMutations('contract_verify'), async (req, res) => {
  try {
    const result = await contractService.verifyContractOnExplorer(req.params.address);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Verification failed.' });
  }
});

router.get('/:address', requireAdmin('contracts:read'), (req, res) => {
  const contract = contractService.getContract(req.params.address);
  if (!contract) {
    return res.status(404).json({ ok: false, message: 'Contract not found.' });
  }
  return res.json({ ok: true, contract });
});

router.post('/', requireAdmin('contracts:write'), auditMutations('contract_add'), (req, res) => {
  const result = contractService.addContract(req.body || {}, req.admin);
  res.status(result.ok ? 201 : 400).json(result);
});

router.patch('/:address/review', requireAdmin('contracts:write'), auditMutations('contract_review'), (req, res) => {
  const result = contractService.reviewContract(req.params.address, req.body || {}, req.admin);
  res.status(result.ok ? 200 : 404).json(result);
});

module.exports = router;
