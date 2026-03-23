import { Request, Response, NextFunction } from 'express';
import { issuersService } from './issuers.service';

export class IssuersController {
  async addTrusted(req: Request, res: Response, next: NextFunction) {
    try {
      const { issuerWallet, topics } = req.body;
      const result = await issuersService.addTrusted(issuerWallet, topics);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeTrusted(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.params;
      const result = await issuersService.removeTrusted(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllTrusted(req: Request, res: Response, next: NextFunction) {
    try {
      const issuers = await issuersService.getAllTrusted();
      return res.status(200).json({ issuers });
    } catch (error) {
      next(error);
    }
  }
}

export const issuersController = new IssuersController();
