// Mock in-memory trusted issuers store
const trustedIssuers = new Map<string, string[]>();

export class IssuersService {
  async addTrusted(issuerWallet: string, topics: string[]) {
    trustedIssuers.set(issuerWallet, topics);
    return { issuerWallet, topics };
  }

  async removeTrusted(issuerWallet: string) {
    trustedIssuers.delete(issuerWallet);
    return { status: 'removed', issuerWallet };
  }

  async getAllTrusted() {
    const issuers: any[] = [];
    trustedIssuers.forEach((topics, wallet) => {
      issuers.push({ wallet, topics });
    });
    return issuers;
  }
}

export const issuersService = new IssuersService();
