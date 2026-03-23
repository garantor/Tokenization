import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../common/response';
import { tokensService } from './tokens.service';

export class TokensController {
  async mint(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet, amount } = req.body;
      if (!amount) return res.status(400).json({ error: 'amount is required' });
      
      const result = await tokensService.mint(wallet, amount);
      return res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }

  async batchMint(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipients } = req.body;
      const result = await tokensService.batchMint(recipients);
      return res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }

  async burn(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet, amount } = req.body;
      const result = await tokensService.burn(wallet, amount);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const tokensController = new TokensController();
