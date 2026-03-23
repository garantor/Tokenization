import { Router } from 'express';
import { adminController } from './admin.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/admin/force-transfer', auth('regulator'), adminController.forceTransfer);
router.post('/admin/pause', auth('regulator'), adminController.pause);
router.post('/admin/unpause', auth('regulator'), adminController.unpause);

export { router as adminRouter };
