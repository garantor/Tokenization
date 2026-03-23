export class EventsService {
  getStatus() {
    return {
      lastIndexedBlock: 1000,
      chain: 'hardhat'
    };
  }

  async resync() {
    return { status: 'resyncing' };
  }
}

export const eventsService = new EventsService();
