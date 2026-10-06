import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

router.get('/health', healthController.checkHealth);
router.get('/crash', healthController.simulateCrash);
router.get('/metrics', healthController.getMetrics);

export default router;