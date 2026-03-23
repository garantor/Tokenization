// Mock in-memory admin store
let tokenPaused = false;

export class AdminService {
  async forceTransfer(from: string, to: string, amount: string) {
    // Regulator skip compliance checks
    return {
      txHash: `0x_force_${Math.random().toString(16).slice(2, 66)}`,
      from,
      to,
      amount
    };
  }

  async pause() {
    tokenPaused = true;
    return { paused: true };
  }

  async unpause() {
    tokenPaused = false;
    return { paused: false };
  }

  isPaused() {
    return tokenPaused;
  }
}

export const adminService = new AdminService();
