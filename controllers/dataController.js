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
