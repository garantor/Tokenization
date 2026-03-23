// Mock in-memory store
const claimsStore = new Map<string, any[]>();
const topicsStore = new Set<string>();

export class ClaimsService {
  async issue(wallet: string, topic: string, issuer: string) {
    const claim = {
      claimId: `claim_${Date.now()}`,
      wallet,
      topic,
      issuer,
      status: 'issued'
    };
    
    const existing = claimsStore.get(wallet) || [];
    existing.push(claim);
    claimsStore.set(wallet, existing);
    
    return claim;
  }

  async revoke(wallet: string, topic: string) {
    const existing = claimsStore.get(wallet) || [];
    const updated = existing.filter(c => c.topic !== topic);
    claimsStore.set(wallet, updated);
    return { status: 'revoked', wallet, topic };
  }

  async getClaimsByWallet(wallet: string) {
    return claimsStore.get(wallet) || [];
  }

  async addTopic(topic: string) {
    topicsStore.add(topic);
    return { topic };
  }

  async getTopics() {
    return Array.from(topicsStore);
  }
}

export const claimsService = new ClaimsService();
