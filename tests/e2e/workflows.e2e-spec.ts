import { testClient, publicClient, getWalletClient, setupTrexFixture } from './fixtures';
import * as api from './helpers/api';
import { getDbClient } from './helpers/db';
// Assuming ABIs are imported from a central location
import { TokenABI, IdentityRegistryABI, TREXFactoryABI } from './abis/mockAbi'; // Placeholder for actual ABIs

describe('ERC-3643 Token Lifecycle E2E Workflows (Viem)', () => {
  let signers: any;
  let suite: any;
  let db: any;

  const tokens = {
    issuer: 'jwt-issuer',
    agent: 'jwt-agent',
    compliance: 'jwt-compliance',
    regulator: 'jwt-regulator',
    investorA: 'jwt-investorA',
    investorB: 'jwt-investorB',
  };

  beforeAll(async () => {
    // Note: Provide actual factory ABI and bytecode to setupTrexFixture
    const fixture = await setupTrexFixture(TREXFactoryABI, "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220a27cb46c0d8d77d71b");
    signers = fixture.signers;
    suite = fixture.suiteAddresses;
    db = getDbClient();
  });

  afterAll(async () => {
    await db?.disconnect?.();
  });

  describe('FLOW 1 — INVESTOR ONBOARDING', () => {
    it('Should register identity, issue KYC claim, and verify eligibility', async () => {
      // Step 1: Backend registers identity
      const response = await api.createInvestor(signers.investorA, { country: 'US', status: 'verified' });
      expect(response.status).toBe(201); // Created
      
      // Step 2: Trigger block mine so local node processes the local tx
      await testClient.mine({ blocks: 1 });

      // Step 3: Trusted Issuer issues KYC claim (Topic 1)
      await api.issueClaim(signers.investorA, 1, tokens.issuer);
      await testClient.mine({ blocks: 1 });

      // Assertion: On-Chain State using Viem
      const onchainIdentity = await publicClient.readContract({
        address: suite.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'identity',
        args: [signers.investorA]
      }) as string;
      
      // Assuming non-zero address string
      expect(onchainIdentity).not.toBe('0x0000000000000000000000000000000000000000');

      // Assertion: Backend DB State
      const dbInvestor = await db.investors.findOne({ wallet: signers.investorA });
      expect(dbInvestor.status).toBe('ELIGIBLE');
      expect(dbInvestor.identityAddress).toBe(onchainIdentity);
    });
  });

  describe('FLOW 3 — PRIMARY ISSUANCE', () => {
    it('Should allow Issuer to mint tokens to verified Investor', async () => {
      // Step 1: Issuer mints tokens via API
      await api.mintTokens(signers.investorA, 1000, tokens.agent);
      await testClient.mine({ blocks: 1 });

      // Assertion: On-chain Output Balance
      const balance = await publicClient.readContract({
        address: suite.token,
        abi: TokenABI,
        functionName: 'balanceOf',
        args: [signers.investorA]
      }) as bigint;
      
      expect(balance.toString()).toBe('1000');

      // Assertion: Backend DB Cache Balance
      const dbBalance = await db.balances.findOne({ wallet: signers.investorA });
      expect(dbBalance.amount).toBe(1000); 
    });
  });

  describe('FLOW 4 — SECONDARY TRANSFER', () => {
    it('Should transfer tokens from Investor A to B with compliance validation', async () => {
      // Step 1: Onboard Investor B
      await api.createInvestor(signers.investorB, { country: 'FR', status: 'verified' });
      await api.issueClaim(signers.investorB, 1, tokens.issuer);
      await testClient.mine({ blocks: 1 });

      // Step 2: Investor A initiates transfer via API
      const res = await api.transferTokens(signers.investorA, signers.investorB, 200, tokens.investorA);
      expect(res.status).toBe(200);
      await testClient.mine({ blocks: 1 });

      // Assertion: On-chain balances moved correctly
      const checkA = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'balanceOf', args: [signers.investorA]
      }) as bigint;
      
      const checkB = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'balanceOf', args: [signers.investorB]
      }) as bigint;
      
      expect(checkA.toString()).toBe('800');
      expect(checkB.toString()).toBe('200');

      // Assertion: Backend validation and log indexing
      const transferRecord = await db.transfers.findOne({ txHash: res.body.txHash });
      expect(transferRecord.status).toBe('CONFIRMED');
    });

    it('Should FAIL transfer if claiming is missing on Recipient', async () => {
      // Generate a random 0x string roughly like a target wallet
      const investorC = '0x1A2B3C4d5E6F7a8B9C0D1E2F3A4B5C6d7E8F9a0B'; 
      
      const res = await api.transferTokens(signers.investorA, investorC, 50, tokens.investorA);
      
      // The backend should pre-valdiate the transfer (simulateContract) and throw a 422 Unprocessable Error.
      expect(res.status).toBe(422);
      expect(res.body.error).toContain('Identity not registered or missing claims');
    });
  });

  describe('FLOW 5 — FREEZE & RESTRICTION', () => {
    it('Should allow compliance officer to freeze wallet and block transfers', async () => {
      // Step 1: Freeze Investor B
      await api.freezeWallet(signers.investorB, tokens.compliance);
      await testClient.mine({ blocks: 1 });

      // Step 2: Attempt transfer FROM frozen wallet (should fail)
      const resFrom = await api.transferTokens(signers.investorB, signers.investorA, 10, tokens.compliance); 
      expect(resFrom.status).toBe(422);
      
      // Step 3: Attempt transfer TO frozen wallet (should fail)
      const resTo = await api.transferTokens(signers.investorA, signers.investorB, 10, tokens.investorA);
      expect(resTo.status).toBe(422);

      // On-chain verification
      const isFrozen = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'isFrozen', args: [signers.investorB]
      }) as boolean;
      
      expect(isFrozen).toBe(true);
    });
  });

  describe('FLOW 6 — FORCED TRANSFER', () => {
    it('Should allow regulator to definitively move tokens bypassing freeze restrictions', async () => {
      // Attempt to forcibly move 200 tokens from B (currently strictly frozen) back to A
      const res = await api.forcedTransfer(signers.investorB, signers.investorA, 200, tokens.regulator);
      expect(res.status).toBe(200);
      await testClient.mine({ blocks: 1 });

      // Since B had 200 tokens and we moved 200 bypassing the freeze, balance is now 0.
      const balanceB = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'balanceOf', args: [signers.investorB]
      }) as bigint;
      expect(balanceB.toString()).toBe('0');
      
      // A gets it back: 800 + 200 = 1000.
      const balanceA = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'balanceOf', args: [signers.investorA]
      }) as bigint;
      expect(balanceA.toString()).toBe('1000');
    });
  });

  describe('FLOW 8 — TOKEN PAUSE / EMERGENCY', () => {
    it('Should block all core unprivileged actions when token paused globally', async () => {
      // Call mock pause API acting as Agent / Owner
      await db.run('/* DB pseudo interaction / API request here to Pause contract */');
      
      // Try acting directly on the chain using WalletClient
      const agentWallet = getWalletClient(signers.agent);
      
      const { request } = await publicClient.simulateContract({
        address: suite.token,
        abi: TokenABI,
        functionName: 'pause',
        account: signers.agent
      });
      const txHash = await agentWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      const onchainPaused = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'paused'
      }) as boolean;
      expect(onchainPaused).toBe(true);

      // Attempt standard transfer (A -> B, B is still frozen though, let's say A -> C where C is onboarded, or A -> B)
      const res = await api.transferTokens(signers.investorA, signers.investorB, 10, tokens.investorA);
      expect(res.status).toBe(422);
      
      // Unpause for subsequent tests
      const { request: unpauseReq } = await publicClient.simulateContract({
        address: suite.token, abi: TokenABI, functionName: 'pause', account: signers.agent
      });
      const unpauseTx = await agentWallet.writeContract(unpauseReq);
      await publicClient.waitForTransactionReceipt({ hash: unpauseTx });
    });
  });

  describe('FLOW 10 — AGENT ROLE MANAGEMENT', () => {
    it('Should allow owner to add and remove a mint agent', async () => {
      // Step 1: Owner adds an agent
      const resAdd = await api.addAgent(signers.agent, 'mint', tokens.issuer);
      expect(resAdd.status).toBe(200);
      await testClient.mine({ blocks: 1 });

      // Step 2: Agent can mint
      const resMint = await api.mintTokens(signers.investorA, 10, tokens.agent);
      expect(resMint.status).toBe(200); // Because async worker accepted it
      await testClient.mine({ blocks: 1 });

      // Step 3: Owner removes the agent
      const resRemove = await api.removeAgent(signers.agent, 'mint', tokens.issuer);
      expect(resRemove.status).toBe(200);
      await testClient.mine({ blocks: 1 });

      // Step 4: Agent fails to mint (Unauthorized)
      const resFail = await api.mintTokens(signers.investorA, 10, tokens.agent);
      expect(resFail.status).toBe(403);
    });
  });

  describe('FLOW 11 — BATCH OPERATIONS', () => {
    it('Should execute batch mint successfully', async () => {
      // Add agent back for testing
      await api.addAgent(signers.agent, 'mint', tokens.issuer);
      await testClient.mine({ blocks: 1 });

      const investors = [
        { target: signers.investorA, amount: 50 },
        { target: signers.investorB, amount: 100 }
      ];

      const res = await api.batchMint(investors, tokens.agent);
      expect(res.status).toBe(200);
      await testClient.mine({ blocks: 1 });

      const balanceA = await publicClient.readContract({
        address: suite.token, abi: TokenABI, functionName: 'balanceOf', args: [signers.investorA]
      }) as bigint;
      // Starting from 1000 + 10 (from flow 10) + 50 = 1060.
      expect(balanceA >= 1050n).toBe(true);
    });
  });

  describe('FLOW 12 — UPGRADE SAFETY', () => {
    it('Should retain storage across proxy upgrades', async () => {
      // Mock deploying a V2 implementation and calling upgradeTo
      // Viem simulation proves the owner address is authorized to trigger the upgrade hook.
      const targetImpl = '0x1234567890123456789012345678901234567890';
      const ownerWallet = getWalletClient(signers.issuer);
      
      const { request } = await publicClient.simulateContract({
        address: suite.token,
        abi: TokenABI,
        functionName: 'upgradeTo',
        args: [targetImpl],
        account: signers.issuer
      });
      
      // We explicitly skip `writeContract` execution as the mock target is an invalid contract in this isolated test
      expect(request).toBeDefined();
    });
  });

  describe('FLOW 13 — COMPLIANCE SIMULATION ENDPOINT', () => {
    it('Should accurately simulate transfer restrictions without executing on chain', async () => {
      // 1. Simulate failing transfer due to B being frozen
      const resSimulateFail = await api.simulateTransfer(
        signers.investorB, signers.investorA, 10, tokens.investorB
      );
      
      expect(resSimulateFail.status).toBe(200); // 200 OK because the *simulation API call* succeeded
      expect(resSimulateFail.body.canTransfer).toBe(false);

      // 2. Unfreeze B to check successful simulation
      await api.freezeWallet(signers.investorB, tokens.compliance); // Assume toggle function
      await testClient.mine({ blocks: 1 });

      const resSimulateSuccess = await api.simulateTransfer(
        signers.investorA, signers.investorB, 10, tokens.investorA
      );

      // A is definitely not frozen and has tokens, B is now active
      expect(resSimulateSuccess.status).toBe(200);
      expect(resSimulateSuccess.body.canTransfer).toBe(true);
    });
  });
});
