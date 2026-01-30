import express from 'express';
import { getDashboardCharts, getCallsByState } from '../controllers/dashboardChartController.js';
import { getCallsBotsData } from '../controllers/callsBotsController.js';

const router = express.Router();

// Dashboard charts routes
router.get('/charts', getDashboardCharts);
router.get('/state/:state', getCallsByState);

// Calls and Bots data route
router.get('/calls-bots', getCallsBotsData);

export default router;
