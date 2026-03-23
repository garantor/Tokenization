// Mock in-memory agents store
const agentsStore = new Map<string, string>();
const VALID_ROLES = ['MINT_AGENT', 'IDENTITY_AGENT', 'CLAIM_AGENT'];

export class AgentsService {
  async addAgent(wallet: string, role: string) {
    if (!VALID_ROLES.includes(role)) {
      throw { status: 400, message: 'invalid role' };
    }
    agentsStore.set(wallet, role);
    return { wallet, role };
  }

  async removeAgent(wallet: string) {
    agentsStore.delete(wallet);
    return { status: 'removed', wallet };
  }

  async getAllAgents() {
    const agents: any[] = [];
    agentsStore.forEach((role, wallet) => {
      agents.push({ wallet, role });
    });
    return agents;
  }
}

export const agentsService = new AgentsService();
