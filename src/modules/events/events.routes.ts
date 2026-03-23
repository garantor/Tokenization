import { Router } from 'express';
import { eventsController } from './events.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/events/status', eventsController.getStatus);
router.post('/events/resync', auth('regulator'), eventsController.resync);

export { router as eventsRouter };
