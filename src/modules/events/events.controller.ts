import { Request, Response, NextFunction } from 'express';
import { eventsService } from './events.service';

export class EventsController {
  getStatus(req: Request, res: Response) {
    return res.status(200).json(eventsService.getStatus());
  }

  async resync(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventsService.resync();
      return res.status(202).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
