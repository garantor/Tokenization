import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseEventLogs,
  PublicClient,
  WalletClient,
  Account
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from 'viem/chains';
import { config } from '../config';
import { TREXFactoryABI, TokenABI, IdentityRegistryABI } from '../config/abis';

export class BlockchainService {
  private publicClient: PublicClient;
  private issuerAccount: Account;
  private agentAccount: Account;

  constructor() {
    this.publicClient = createPublicClient({
      chain: hardhat,
      transport: http(config.blockchain.rpcUrl),
    });

    this.issuerAccount = privateKeyToAccount(config.blockchain.issuerKey);
    this.agentAccount = privateKeyToAccount(config.blockchain.agentKey);
  }

  /**
   * Get the wallet client for a specific role (Issuer or Agent)
   */
  private getWalletClient(account: Account): WalletClient {
    return createWalletClient({
      account,
      chain: hardhat,
      transport: http(config.blockchain.rpcUrl),
    });
  }

  /**
   * Register an investor on-chain
   */
  async registerInvestor(walletAddress: `0x${string}`, identityAddress: `0x${string}`, country: number) {
    const client = this.getWalletClient(this.agentAccount);
    
    const { request } = await this.publicClient.simulateContract({
      address: config.contracts.identityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'registerIdentity',
      args: [walletAddress, identityAddress, country],
      account: this.agentAccount,
    });

    const hash = await client.writeContract(request);
    return await this.publicClient.waitForTransactionReceipt({ hash });
  }

  /**
   * Mint tokens to an investor
   */
  async mintTokens(to: `0x${string}`, amount: bigint) {
    const client = this.getWalletClient(this.agentAccount);

    const { request } = await this.publicClient.simulateContract({
      address: config.contracts.token,
      abi: TokenABI,
      functionName: 'mint',
      args: [to, amount],
      account: this.agentAccount,
    });

    const hash = await client.writeContract(request);
    return await this.publicClient.waitForTransactionReceipt({ hash });
  }

  /**
   * Check if a transfer is compliant
   */
  async canTransfer(from: `0x${string}`, to: `0x${string}`, amount: bigint) {
    return await this.publicClient.readContract({
      address: config.contracts.token,
      abi: TokenABI,
      functionName: 'canTransfer',
      args: [from, to, amount],
    });
  }

  /**
   * Get public client for custom operations
   */
  getPublicClient() {
    return this.publicClient;
  }
}

export const blockchainService = new BlockchainService();
