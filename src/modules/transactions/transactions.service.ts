// Mock transactions
const txStore = new Map<string, any>([
  ['0xSomeTxHash', { txHash: '0xSomeTxHash', status: 'confirmed', from: '0xAAA', to: '0xBBB', amount: '100' }]
]);

export class TransactionsService {
  async getByHash(txHash: string) {
    const tx = txStore.get(txHash);
    if (!tx) throw { status: 404, message: 'transaction not found' };
    return tx;
  }

  async getByWallet(wallet: string) {
    const txs: any[] = [];
    txStore.forEach(tx => {
      if (tx.from === wallet || tx.to === wallet) {
        txs.push(tx);
      }
    });
    return txs;
  }
}

export const transactionsService = new TransactionsService();
