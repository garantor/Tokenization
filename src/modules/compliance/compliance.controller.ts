import { Request, Response, NextFunction } from 'express';
import { complianceService } from './compliance.service';

export class ComplianceController {
  async freeze(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.body;
      const result = await complianceService.freeze(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unfreeze(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.body;
      const result = await complianceService.unfreeze(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async freezeTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet, amount } = req.body;
      const result = await complianceService.freezeTokens(wallet, amount);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.params;
      const result = await complianceService.getStatus(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const complianceController = new ComplianceController();
