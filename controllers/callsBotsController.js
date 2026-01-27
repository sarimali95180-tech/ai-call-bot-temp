import sequelize from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import { Op } from 'sequelize';
import Call from '../models/call.js';
import Bot from '../models/bot.js';

/**
 * Get Bots and Calls data with transfer status and area-based analytics
 * @public - No authentication required
 * Fetches:
 * 1. All active Bots from Bots table
 * 2. Calls that transferred or ready for transfer in last 7 days
 * 3. Calls ready for transfer in last 30 days
 * 4. Calls grouped by Area with Avg calls and Avg Age
 */
export const getCallsBotsData = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Fetch all active Bots
    const bots = await Bot.findAll({
      where: {
        status: 'active',
      },
      attributes: ['bot_id', 'name', 'status', 'org_id'],
      raw: true,
    });

    // 2. Fetch all calls from last 30 days and filter in JavaScript
    const allCallsLast30 = await Call.findAll({
      where: {
        call_start_time: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      attributes: [
        'call_id',
        'caller_number',
        'call_duration',
        'call_start_time',
        'call_end_time',
        'customer_state',
        'customer_age',
        'customer_zip_code',
        'ready_for_transfer',
      ],
      raw: true,
    });

    // Filter 7-day calls
    const callsLast7Days = allCallsLast30.filter((call) => {
      const callDate = new Date(call.call_start_time);
      const isReady = call.ready_for_transfer && 
                      (call.ready_for_transfer.toString().toLowerCase() === 'yes' ||
                       call.ready_for_transfer.toString().toLowerCase() === 'true' ||
                       call.ready_for_transfer.toString() === '1');
      return callDate >= sevenDaysAgo && isReady;
    });

    // Filter 30-day calls
    const callsLast30Days = allCallsLast30.filter((call) => {
      const isReady = call.ready_for_transfer && 
                      (call.ready_for_transfer.toString().toLowerCase() === 'yes' ||
                       call.ready_for_transfer.toString().toLowerCase() === 'true' ||
                       call.ready_for_transfer.toString() === '1');
      return isReady;
    });

    // 3. Get all calls for area grouping
    const allCallsForArea = await Call.findAll({
      attributes: ['call_id', 'customer_state', 'customer_age'],
      raw: true,
    });

    // Group calls by area and calculate averages
    const areaMap = {};
    allCallsForArea.forEach((call) => {
      const area = call.customer_state || 'Unknown';
      if (!areaMap[area]) {
        areaMap[area] = { calls: [], totalAge: 0, validAgeCount: 0 };
      }
      areaMap[area].calls.push(call.call_id);

      // Only add age if it's a valid number (not N/A or null)
      if (call.customer_age && call.customer_age !== 'N/A' && call.customer_age !== null) {
        const age = parseInt(call.customer_age);
        if (!isNaN(age)) {
          areaMap[area].totalAge += age;
          areaMap[area].validAgeCount += 1;
        }
      }
    });

    // Convert to array and sort by call count
    const callsByArea = Object.keys(areaMap)
      .map((area) => {
        const data = areaMap[area];
        return {
          area: area,
          avg_calls: data.calls.length,
          avg_age: data.validAgeCount > 0 ? Math.round(data.totalAge / data.validAgeCount) : 0,
        };
      })
      .sort((a, b) => b.avg_calls - a.avg_calls);

    return successResponse(res, 200, {
      success: true,
      message: 'Bots and Calls data fetched successfully',
      data: {
        bots: {
          total_bots: bots.length,
          bots: bots,
        },
        calls_7_days: {
          total_calls: callsLast7Days.length,
          calls: callsLast7Days,
        },
        calls_30_days: {
          total_calls: callsLast30Days.length,
          calls: callsLast30Days,
        },
        calls_by_area: {
          total_areas: callsByArea.length,
          data: callsByArea,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching calls-bots data:', err);
    return errorResponse(res, 500, 'Failed to fetch calls-bots data', err.message);
  }
};
