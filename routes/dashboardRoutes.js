import express from 'express';
import { getDashboardCharts, getCallsByState } from '../controllers/dashboardChartController.js';

const router = express.Router();

// Dashboard charts routes
router.get('/charts', getDashboardCharts);
router.get('/state/:state', getCallsByState);

export default router;
