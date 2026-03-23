import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { tokensController } from './tokens.controller';

const router = Router();

router.post('/tokens/mint', auth('agent'), tokensController.mint);
router.post('/tokens/batch-mint', auth('agent'), tokensController.batchMint);
router.post('/tokens/burn', auth('agent'), tokensController.burn);
router.post('/tokens/transfer', auth('investor'), tokensController.transfer);
router.post('/tokens/batch-transfer', auth('agent'), tokensController.batchTransfer);
router.post('/tokens/simulate-transfer', auth('investor'), tokensController.simulateTransfer);

router.post('/tokens/deploy', auth('issuer'), tokensController.deploy);
router.get('/tokens/config', tokensController.getConfig);
router.get('/tokens/balance/:wallet', tokensController.getBalance);
router.get('/investors/:wallet/portfolio', tokensController.getPortfolio);

export { router as tokensRouter };
