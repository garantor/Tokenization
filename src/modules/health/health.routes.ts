import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/health', healthController.getApiHealth);
router.get('/health/blockchain', healthController.getBlockchainHealth);

export { router as healthRouter };
