export class HealthService {
  getApiHealth() {
    return {
      status: 'ok',
      uptime: process.uptime()
    };
  }

  getBlockchainHealth() {
    return {
      connected: true,
      chainId: 31337,
      blockNumber: 12345
    };
  }
}

export const healthService = new HealthService();
