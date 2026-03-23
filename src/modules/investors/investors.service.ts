import { blockchainService } from '../../services/blockchain.service';

// Mock in-memory store (to be replaced with database later)
const investors = new Map<string, any>();

export class InvestorsService {
  async register(wallet: string, country: string, kycProviderId: string, metadata: any) {
    if (investors.has(wallet)) {
      throw { status: 409, message: 'wallet already registered' };
    }

    // In a real scenario, we'd deploy an Identity contract for the user.
    // For now, we use the wallet itself as identityAddress.
    const identityAddress = wallet;
    const numericCountry = this.countryToNumeric(country);

    // Note: We can uncomment the blockchain call when ready to test real on-chain reg
    // await blockchainService.registerInvestor(wallet as `0x${string}`, identityAddress as `0x${string}`, numericCountry);

    const investor = {
      investorId: `inv_${Date.now()}`,
      wallet,
      country,
      kycProviderId,
      identityRegistered: true,
      claims: [],
      frozen: false,
      metadata: metadata || {}
    };

    investors.set(wallet, investor);
    return investor;
  }

  async getProfile(wallet: string) {
    const investor = investors.get(wallet);
    if (!investor) {
      throw { status: 404, message: 'investor not found' };
    }
    return investor;
  }

  async exists(wallet: string): Promise<boolean> {
    return investors.has(wallet);
  }

  async linkWallet(identityWallet: string, newWallet: string) {
    // Logic for linking
    return { status: 'linked', identityWallet, newWallet };
  }

  async unlinkWallet(wallet: string) {
    // Logic for unlinking
    return { status: 'unlinked', wallet };
  }

  async revoke(wallet: string) {
    const investor = investors.get(wallet);
    if (!investor) throw { status: 404, message: 'investor not found' };
    investor.identityRegistered = false;
    return { status: 'revoked', wallet };
  }

  private countryToNumeric(country: string): number {
    const map: Record<string, number> = { 'GB': 826, 'US': 840, 'NG': 566 };
    return map[country] || 0;
  }
}

export const investorsService = new InvestorsService();
