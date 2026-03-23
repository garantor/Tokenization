import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { claimsController } from './claims.controller';

const router = Router();

router.post('/claims/issue', auth('issuer'), claimsController.issue);
router.post('/claims/revoke', auth('issuer'), claimsController.revoke);
router.get('/claims/topics', claimsController.getTopics);
router.post('/claims/topics', auth('compliance'), claimsController.addTopic);
router.get('/claims/:wallet', claimsController.getClaimsByWallet);

export { router as claimsRouter };
