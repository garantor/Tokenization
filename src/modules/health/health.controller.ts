import { Request, Response } from 'express';
import { healthService } from './health.service';

export class HealthController {
  getApiHealth(req: Request, res: Response) {
    return res.status(200).json(healthService.getApiHealth());
  }

  getBlockchainHealth(req: Request, res: Response) {
    return res.status(200).json(healthService.getBlockchainHealth());
  }
}

export const healthController = new HealthController();
