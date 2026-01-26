import sequelize from '../config/database.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

/**
 * Get all data from a specific table
 * @public - No authentication required
 */
export const getTableData = async (req, res) => {
  try {
    const { table } = req.params;
    const { limit = 50, offset = 0, orderBy = 'id', order = 'DESC' } = req.query;

    // Whitelist allowed tables for security
    const allowedTables = [
      'users',
      'bots',
      'calls',
      'organizations',
      'remote_agents',
    ];

    if (!table || !allowedTables.includes(table)) {
      return errorResponse(res, 400, `Invalid table. Allowed tables: ${allowedTables.join(', ')}`);
    }

    // Sanitize parameters
    const limitNum = Math.min(parseInt(limit) || 50, 1000);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    const validOrders = ['ASC', 'DESC'];
    const orderDirection = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const query = `
      SELECT * FROM "public"."${table}"
      ORDER BY "${orderBy}" ${orderDirection}
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    const countQuery = `SELECT COUNT(*) as total FROM "public"."${table}"`;

    const [data, countResult] = await Promise.all([
      sequelize.query(query, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT }),
    ]);

    const total = countResult[0].total;

    return successResponse(res, 200, `Data from ${table} retrieved successfully`, {
      table,
      total: parseInt(total),
      limit: limitNum,
      offset: offsetNum,
      data,
    });
  } catch (error) {
    console.error('Get table data error:', error);
    return errorResponse(res, 500, 'Failed to retrieve table data');
  }
};

/**
 * Get statistics/counts for all tables
 * @public - No authentication required
 */
export const getTableStats = async (req, res) => {
  try {
    const tables = ['users', 'bots', 'calls', 'organizations', 'remote_agents'];
    const stats = {};

    for (const table of tables) {
      try {
        const result = await sequelize.query(
          `SELECT COUNT(*) as count FROM "public"."${table}"`,
          { type: sequelize.QueryTypes.SELECT }
        );
        stats[table] = parseInt(result[0].count);
      } catch (error) {
        stats[table] = 0;
      }
    }

    return successResponse(res, 200, 'Table statistics retrieved successfully', stats);
  } catch (error) {
    console.error('Get table stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve table statistics');
  }
};

/**
 * Get comprehensive dashboard statistics
 * Returns: Total Calls, Total Recordings, Total Bots, Avg TTS Rate, Avg LLM Rate
 * @public - No authentication required
 */
export const getDashboardStats = async (req, res) => {
  try {
    let totalCalls = 0;
    let totalRecordings = 0;
    let totalBots = 0;
    let avgTtsRate = 0;
    let avgLlmRate = 0;

    // Query 1: Count total calls
    try {
      const callCountResult = await sequelize.query(
        `SELECT COUNT(*) as total_calls FROM "public"."calls"`,
        { type: sequelize.QueryTypes.SELECT }
      );
      totalCalls = parseInt(callCountResult[0].total_calls) || 0;
    } catch (err) {
      console.error('Error counting calls:', err.message);
    }

    // Query 2: Count total recordings (calls with recording_path)
    try {
      const recordingCountResult = await sequelize.query(
        `SELECT COUNT(*) as total_recordings FROM "public"."calls" WHERE "recording_path" IS NOT NULL AND "recording_path" != ''`,
        { type: sequelize.QueryTypes.SELECT }
      );
      totalRecordings = parseInt(recordingCountResult[0].total_recordings) || 0;
    } catch (err) {
      console.error('Error counting recordings:', err.message);
    }

    // Query 3: Count total bots
    try {
      const botCountResult = await sequelize.query(
        `SELECT COUNT(*) as total_bots FROM "public"."bots"`,
        { type: sequelize.QueryTypes.SELECT }
      );
      totalBots = parseInt(botCountResult[0].total_bots) || 0;
    } catch (err) {
      console.error('Error counting bots:', err.message);
    }

    // Query 4: Average TTS rate (tts_cache_hit_rate)
    try {
      const ttsCacheResult = await sequelize.query(
        `SELECT AVG(CAST(REGEXP_REPLACE(CAST("tts_cache_hit_rate" AS TEXT), '[^0-9.]', '', 'g') AS FLOAT)) as avg_tts_rate FROM "public"."calls" WHERE "tts_cache_hit_rate" IS NOT NULL`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('TTS Cache Result:', ttsCacheResult);
      avgTtsRate = ttsCacheResult[0]?.avg_tts_rate ? parseFloat(parseFloat(ttsCacheResult[0].avg_tts_rate).toFixed(2)) : 0;
    } catch (err) {
      console.error('Error calculating avg TTS rate:', err.message);
    }

    // Query 5: Average LLM rate (llm_cache_hit_rate)
    try {
      const llmCacheResult = await sequelize.query(
        `SELECT AVG(CAST(REGEXP_REPLACE(CAST("llm_cache_hit_rate" AS TEXT), '[^0-9.]', '', 'g') AS FLOAT)) as avg_llm_rate FROM "public"."calls" WHERE "llm_cache_hit_rate" IS NOT NULL`,
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('LLM Cache Result:', llmCacheResult);
      avgLlmRate = llmCacheResult[0]?.avg_llm_rate ? parseFloat(parseFloat(llmCacheResult[0].avg_llm_rate).toFixed(2)) : 0;
    } catch (err) {
      console.error('Error calculating avg LLM rate:', err.message);
    }

    const dashboardStats = {
      total_calls: totalCalls,
      total_recordings: totalRecordings,
      total_bots: totalBots,
      avg_tts_rate: avgTtsRate,
      avg_llm_rate: avgLlmRate,
    };

    return successResponse(res, 200, 'Dashboard statistics retrieved successfully', dashboardStats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 500, 'Failed to retrieve dashboard statistics');
  }
};
