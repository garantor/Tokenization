import { Request, Response, NextFunction } from 'express';
import { agentsService } from './agents.service';

export class AgentsController {
  async addAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet, role } = req.body;
      const result = await agentsService.addAgent(wallet, role);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const { wallet } = req.params;
      const result = await agentsService.removeAgent(wallet);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await agentsService.getAllAgents();
      return res.status(200).json({ agents });
    } catch (error) {
      next(error);
    }
  }
}

export const agentsController = new AgentsController();
