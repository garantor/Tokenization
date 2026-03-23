import { Router } from 'express';
import { agentsController } from './agents.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/agents', auth('issuer'), agentsController.addAgent);
router.delete('/agents/:wallet', auth('issuer'), agentsController.removeAgent);
router.get('/agents', auth('issuer'), agentsController.getAllAgents);

export { router as agentsRouter };
