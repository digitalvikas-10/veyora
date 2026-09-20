import { Router } from 'express';
import { getHealth, ping, reconnectDatabase } from '../controllers/health.controller.js';

const router = Router();

router.get('/', getHealth);
router.get('/ping', ping);
router.post('/reconnect-db', reconnectDatabase);

export default router;
