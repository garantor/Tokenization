import { Request, Response, NextFunction } from 'express';
import { transactionsService } from './transactions.service';

export class TransactionsController {
  async getByHash(req: Request, res: Response, next: NextFunction) {
    try {
      const { txHash } = req.params;
      const result = await transactionsService.getByHash(txHash);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.query;
      if (!wallet) return res.status(400).json({ error: 'wallet query param required' });
      const transactions = await transactionsService.getByWallet(wallet as string);
      return res.status(200).json({ transactions });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionsController = new TransactionsController();
