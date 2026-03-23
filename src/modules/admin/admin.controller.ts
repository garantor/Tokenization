import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export class AdminController {
  async forceTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to, amount } = req.body;
      const result = await adminService.forceTransfer(from, to, amount);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.pause();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async unpause(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.unpause();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
