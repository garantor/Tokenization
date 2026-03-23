import { Router } from 'express';
import { complianceController } from './compliance.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/compliance/freeze', auth('compliance'), complianceController.freeze);
router.post('/compliance/unfreeze', auth('compliance'), complianceController.unfreeze);
router.post('/compliance/freeze-tokens', auth('compliance'), complianceController.freezeTokens);
router.get('/compliance/status/:wallet', complianceController.getStatus);

export { router as complianceRouter };
