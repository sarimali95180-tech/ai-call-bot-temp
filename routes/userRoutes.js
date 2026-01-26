import express from 'express';
import { login, getMe, updateProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getTableData, getTableStats, getDashboardStats } from '../controllers/dataController.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.get('/stats', getTableStats);
router.get('/dashboard-stats', getDashboardStats);
router.get('/data/:table', getTableData);

// Private routes (requires authentication)
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

export default router;
