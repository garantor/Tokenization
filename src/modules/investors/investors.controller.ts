import { Request, Response, NextFunction } from 'express';
import { investorsService } from './investors.service';
import { successResponse } from '../../common/response';

export class InvestorsController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet, country, kycProviderId, metadata } = req.body;
      if (!wallet) return res.status(400).json({ error: 'wallet is required' });
      
      const investor = await investorsService.register(wallet, country, kycProviderId, metadata);
      return successResponse(res, investor, 201);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.params;
      const investor = await investorsService.getProfile(wallet);
      return res.status(200).json(investor);
    } catch (error) {
      next(error);
    }
  }

  async linkWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { identityWallet, newWallet } = req.body;
      if (!identityWallet || !newWallet) return res.status(400).json({ error: 'both wallets required' });
      
      const result = await investorsService.linkWallet(identityWallet, newWallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unlinkWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.body;
      if (!wallet) return res.status(400).json({ error: 'wallet required' });
      
      const result = await investorsService.unlinkWallet(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.body;
      if (!wallet) return res.status(400).json({ error: 'wallet required' });
      
      const result = await investorsService.revoke(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const investorsController = new InvestorsController();
