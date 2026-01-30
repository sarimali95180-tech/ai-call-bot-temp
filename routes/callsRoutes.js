import express from 'express';
import { getAllCalls, getCallById, getCallStats } from '../controllers/callsController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getAllCalls);
router.get('/stats', getCallStats);
router.get('/:callId', getCallById);

export default router;
