import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { tokensController } from './tokens.controller';

const router = Router();

router.post('/tokens/mint', auth('agent'), tokensController.mint);
router.post('/tokens/batch-mint', auth('agent'), tokensController.batchMint);
router.post('/tokens/burn', auth('agent'), tokensController.burn);

export { router as tokensRouter };
