// Mock in-memory balances
const balances = new Map<string, bigint>();

export class TokensService {
  async mint(wallet: string, amount: string) {
    const mintAmount = BigInt(amount);
    const current = balances.get(wallet) || 0n;
    balances.set(wallet, current + mintAmount);
    
    return {
      jobId: `job_mint_${Date.now()}`,
      wallet,
      amount
    };
  }

  async batchMint(recipients: { wallet: string, amount: string }[]) {
    for (const { wallet, amount } of recipients) {
      const mintAmount = BigInt(amount);
      const current = balances.get(wallet) || 0n;
      balances.set(wallet, current + mintAmount);
    }
    
    return {
      jobId: `job_batch_${Date.now()}`,
      count: recipients.length
    };
  }

  async burn(wallet: string, amount: string) {
    const burnAmount = BigInt(amount);
    const current = balances.get(wallet) || 0n;
    
    if (current < burnAmount) {
      throw { status: 400, message: 'insufficient balance to burn' };
    }
    
    balances.set(wallet, current - burnAmount);
    return { status: 'burned', wallet, amount };
  }

  // Helper for other modules (Portfolio)
  getBalance(wallet: string) {
    return (balances.get(wallet) || 0n).toString();
  }
}

export const tokensService = new TokensService();
