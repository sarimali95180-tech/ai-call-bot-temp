import Call from '../models/call.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

/**
 * Get all calls with optional pagination
 * @public - No authentication required
 * @param limit - Number of records (default: 50, set to -1 or 'all' to fetch all)
 */
export const getAllCalls = async (req, res) => {
  try {
    const { limit, offset = 0, order = 'DESC' } = req.query;

    // Check if user wants all records
    const getAll = limit === '-1' || limit === 'all';
    
    // Sanitize parameters
    const limitNum = getAll ? null : Math.min(parseInt(limit) || 50, 1000);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    const validOrders = ['ASC', 'DESC'];
    const orderDirection = validOrders.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const { count, rows } = await Call.findAndCountAll({
      limit: limitNum,
      offset: offsetNum,
      order: [['call_start_time', orderDirection]],
      raw: true,
    });

    return successResponse(res, 200, 'All calls retrieved successfully', {
      total: count,
      limit: limitNum || 'all',
      offset: offsetNum,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return errorResponse(res, 500, 'Error fetching calls', { error: error.message });
  }
};

/**
 * Get call by ID
 * @public - No authentication required
 */
export const getCallById = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await Call.findByPk(callId, { raw: true });

    if (!call) {
      return errorResponse(res, 404, 'Call not found');
    }

    return successResponse(res, 200, 'Call retrieved successfully', call);
  } catch (error) {
    console.error('Error fetching call:', error);
    return errorResponse(res, 500, 'Error fetching call', { error: error.message });
  }
};

/**
 * Get calls count by status
 * @public - No authentication required
 */
export const getCallStats = async (req, res) => {
  try {
    const totalCalls = await Call.count();
    const eligibleCalls = await Call.count({ where: { is_eligible: 'Yes' } });
    const transferReadyCalls = await Call.count({ where: { ready_for_transfer: 'Yes' } });

    return successResponse(res, 200, 'Call statistics retrieved successfully', {
      totalCalls,
      eligibleCalls,
      transferReadyCalls,
      transferNotReady: totalCalls - transferReadyCalls,
    });
  } catch (error) {
    console.error('Error fetching call stats:', error);
    return errorResponse(res, 500, 'Error fetching call stats', { error: error.message });
  }
};
