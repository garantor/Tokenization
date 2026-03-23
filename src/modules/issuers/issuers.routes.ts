import { Router } from 'express';
import { issuersController } from './issuers.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/issuers/trusted', auth('regulator'), issuersController.addTrusted);
router.delete('/issuers/trusted/:wallet', auth('regulator'), issuersController.removeTrusted);
router.get('/issuers/trusted', issuersController.getAllTrusted);

export { router as issuersRouter };
