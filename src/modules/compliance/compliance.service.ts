// Mock in-memory compliance store
const complianceStore = new Map<string, { frozen: boolean, frozenAmount: string }>();

export class ComplianceService {
  async freeze(wallet: string) {
    const status = complianceStore.get(wallet) || { frozen: false, frozenAmount: '0' };
    status.frozen = true;
    complianceStore.set(wallet, status);
    return { wallet, frozen: true };
  }

  async unfreeze(wallet: string) {
    const status = complianceStore.get(wallet) || { frozen: false, frozenAmount: '0' };
    status.frozen = false;
    complianceStore.set(wallet, status);
    return { wallet, frozen: false };
  }

  async freezeTokens(wallet: string, amount: string) {
    const status = complianceStore.get(wallet) || { frozen: false, frozenAmount: '0' };
    status.frozenAmount = amount;
    complianceStore.set(wallet, status);
    return { wallet, frozenAmount: amount };
  }

  async getStatus(wallet: string) {
    const status = complianceStore.get(wallet) || { frozen: false, frozenAmount: '0' };
    return {
      wallet,
      frozen: status.frozen,
      frozenTokens: status.frozenAmount
    };
  }
}

export const complianceService = new ComplianceService();
