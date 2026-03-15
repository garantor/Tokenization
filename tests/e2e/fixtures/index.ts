import { createPublicClient, createWalletClient, createTestClient, http, custom, parseEventLogs } from 'viem';
import { hardhat } from 'viem/chains';
// Assumes you have an ABI generated or exported somewhere. For example:
// import { TREXFactoryABI, TokenABI, IdentityRegistryABI } from '../abis';

const transport = http('http://127.0.0.1:8545');

export const publicClient = createPublicClient({
  chain: hardhat,
  transport,
});

export const testClient = createTestClient({
  chain: hardhat,
  mode: 'hardhat', // or 'anvil' if using Foundry
  transport,
});

export const getWalletClient = (account: `0x${string}`) => 
  createWalletClient({
    account,
    chain: hardhat,
    transport,
  });

/**
 * Parses receipt to extract deployed suite addresses based on TREXSuiteDeployed event
 */
function extractSuiteFromReceipt(receipt: any, factoryAbi: any) {
  const events = parseEventLogs({
    abi: factoryAbi,
    logs: receipt.logs,
    eventName: 'TREXSuiteDeployed'
  });

  if (!events || events.length === 0) throw new Error('TREXSuiteDeployed event not found');
  
  const args = (events[0] as any).args;
  return {
    token: args._token as `0x${string}`,
    identityRegistry: args._ir as `0x${string}`,
    identityRegistryStorage: args._irs as `0x${string}`,
    claimTopicsRegistry: args._ctr as `0x${string}`,
    trustedIssuersRegistry: args._tir as `0x${string}`,
    compliance: args._compliance as `0x${string}`,
  };
}

export async function setupTrexFixture(TREXFactoryABI: any, TREXFactoryBytecode: `0x${string}`) {
  // Common Hardhat local accounts
  const accounts = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // deployer
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // issuer
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // agent
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // complianceOfficer
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // regulator
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // investorA
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // investorB
  ] as `0x${string}`[];

  const [deployer, issuer, agent, complianceOfficer, regulator, investorA, investorB] = accounts;
  const deployerWallet = getWalletClient(deployer);
  const issuerWallet = getWalletClient(issuer);

  // 1. Deploy TREX Factory (using dummy zero addresses for implementations for testing illustration)
  const factoryTxHash = await deployerWallet.deployContract({
    abi: TREXFactoryABI,
    bytecode: TREXFactoryBytecode,
    args: [
      '0x0000000000000000000000000000000000000000', // Token implementation
      '0x0000000000000000000000000000000000000000', // CTR
      '0x0000000000000000000000000000000000000000', // IRS
      '0x0000000000000000000000000000000000000000', // IR
      '0x0000000000000000000000000000000000000000', // TIR
      '0x0000000000000000000000000000000000000000'  // Compliance
    ]
  });
  
  const factoryReceipt = await publicClient.waitForTransactionReceipt({ hash: factoryTxHash });
  const factoryAddress = factoryReceipt.contractAddress!;

  // 2. Deploy Token Suite via Factory
  const { request } = await publicClient.simulateContract({
    address: factoryAddress,
    abi: TREXFactoryABI,
    functionName: 'deployTREXSuite',
    args: [
      '1', // salt
      {
        owner: issuer,
        name: 'Tokenized Security',
        symbol: 'SEC',
        decimals: 18,
        irs: '0x0000000000000000000000000000000000000000',
        ONCHAINID: '0x0000000000000000000000000000000000000000',
        irAgents: [agent],
        tokenAgents: [agent],
        complianceAgents: [complianceOfficer],
        complianceTxs: []
      },
      { claimTopics: [1] } // e.g., Topic 1 is KYC
    ],
    account: issuer
  });

  const txHash = await issuerWallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  
  // 3. Extract deployed proxy addresses
  const suiteAddresses = extractSuiteFromReceipt(receipt, TREXFactoryABI);

  return {
    signers: {
      deployer, 
      issuer, 
      agent, 
      complianceOfficer, 
      regulator, 
      investorA, 
      investorB
    },
    suiteAddresses
  };
}
