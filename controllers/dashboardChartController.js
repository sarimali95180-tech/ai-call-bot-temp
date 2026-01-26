import sequelize from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { Op } from 'sequelize';
import Call from '../models/call.js';

/**
 * Get dashboard charts data with state-wise calls and date-based analytics
 * @public - No authentication required
 */
export const getDashboardCharts = async (req, res) => {
  try {
    // Get state-wise call counts
    const stateWiseCalls = await Call.findAll({
      attributes: [
        'customer_state',
        [sequelize.fn('COUNT', sequelize.col('call_id')), 'total_calls'],
      ],
      where: {
        customer_state: { [Op.ne]: null },
      },
      group: ['customer_state'],
      raw: true,
      order: [[sequelize.fn('COUNT', sequelize.col('call_id')), 'DESC']],
    });

    // Get total calls count
    const totalCallsResult = await Call.count();

    // Get daily total calls (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailyCalls = await Call.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('call_start_time')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('call_id')), 'total_calls'],
      ],
      where: {
        call_start_time: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      group: [sequelize.fn('DATE', sequelize.col('call_start_time'))],
      raw: true,
      order: [[sequelize.fn('DATE', sequelize.col('call_start_time')), 'ASC']],
      subQuery: false,
    });

    // Get weekly total calls (last 4 weeks)
    const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeklyCalls = await Call.findAll({
      attributes: [
        [
          sequelize.fn(
            'to_char',
            sequelize.fn('date_trunc', sequelize.literal("'week'"), sequelize.col('call_start_time')),
            sequelize.literal("'YYYY-MM-DD'")
          ),
          'week_start',
        ],
        [sequelize.fn('COUNT', sequelize.col('call_id')), 'total_calls'],
      ],
      where: {
        call_start_time: {
          [Op.gte]: fourWeeksAgo,
        },
      },
      group: [sequelize.fn('date_trunc', sequelize.literal("'week'"), sequelize.col('call_start_time'))],
      raw: true,
      order: [[sequelize.fn('date_trunc', sequelize.literal("'week'"), sequelize.col('call_start_time')), 'ASC']],
      subQuery: false,
    });

    // Get monthly total calls (last 12 months)
    const twelveMonthsAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    const monthlyCalls = await Call.findAll({
      attributes: [
        [
          sequelize.fn(
            'to_char',
            sequelize.fn('date_trunc', sequelize.literal("'month'"), sequelize.col('call_start_time')),
            sequelize.literal("'YYYY-MM'")
          ),
          'month',
        ],
        [sequelize.fn('COUNT', sequelize.col('call_id')), 'total_calls'],
      ],
      where: {
        call_start_time: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [sequelize.fn('date_trunc', sequelize.literal("'month'"), sequelize.col('call_start_time'))],
      raw: true,
      order: [[sequelize.fn('date_trunc', sequelize.literal("'month'"), sequelize.col('call_start_time')), 'ASC']],
      subQuery: false,
    });

    // Format response data for charts
    const dailyCallsSeries = dailyCalls.map((item) => parseInt(item.total_calls));
    const dailyCallsCategories = dailyCalls.map((item) => item.date);
    const dailyTotal = dailyCallsSeries.length > 0 ? dailyCallsSeries[dailyCallsSeries.length - 1] : 0;

    const weeklyCallsSeries = weeklyCalls.map((item) => parseInt(item.total_calls));
    const weeklyCallsCategories = weeklyCalls.map((item, index) => `Week ${index + 1}`);
    const weeklyTotal = weeklyCallsSeries.length > 0 ? weeklyCallsSeries[weeklyCallsSeries.length - 1] : 0;

    const monthlyCallsSeries = monthlyCalls.map((item) => parseInt(item.total_calls));
    const monthlyCallsCategories = monthlyCalls.map((item) => item.month);
    const monthlyTotal = monthlyCallsSeries.length > 0 ? monthlyCallsSeries[monthlyCallsSeries.length - 1] : 0;

    const dashboardData = {
      stateWiseCallsChart: {
        series: stateWiseCalls.map((item) => ({
          label: item.customer_state || 'Unknown',
          value: parseInt(item.total_calls),
        })),
      },
      dailyCallsChart: {
        categories: dailyCallsCategories,
        series: dailyCallsSeries,
        totals: {
          daily: dailyTotal,
          weekly: weeklyTotal,
          monthly: monthlyTotal,
        },
      },
      weeklyCallsChart: {
        categories: weeklyCallsCategories,
        series: weeklyCallsSeries,
        totals: {
          weekly: weeklyTotal,
        },
      },
      monthlyCallsChart: {
        categories: monthlyCallsCategories,
        series: monthlyCallsSeries,
        totals: {
          monthly: monthlyTotal,
        },
      },
    };

    return successResponse(res, 200, 'Dashboard charts data retrieved successfully', dashboardData);
  } catch (error) {
    console.error('Dashboard chart error:', error);
    return errorResponse(res, 500, 'Failed to retrieve dashboard charts data');
  }
};

/**
 * Get calls by specific state
 * @param {string} state - State name
 */
export const getCallsByState = async (req, res) => {
  try {
    const { state } = req.params;

    if (!state) {
      return errorResponse(res, 400, 'State parameter is required');
    }

    const calls = await Call.findAll({
      where: {
        customer_state: state,
      },
      attributes: ['call_id', 'caller_number', 'call_start_time', 'call_duration', 'customer_state'],
      limit: 100,
      order: [['call_start_time', 'DESC']],
    });

    const totalCalls = await Call.count({
      where: {
        customer_state: state,
      },
    });

    return successResponse(res, 200, `Calls from ${state} retrieved successfully`, {
      state,
      totalCalls,
      calls,
    });
  } catch (error) {
    console.error('Get calls by state error:', error);
    return errorResponse(res, 500, 'Failed to retrieve calls by state');
  }
};
