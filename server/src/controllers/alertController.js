import { query } from '../db/index.js';

export const getAlerts = async (limit = 50, acknowledged = null) => {
  let sql = `
    SELECT a.id, a.sensor_id, a.type, a.message, a.level_value, a.created_at, a.acknowledged, a.acknowledged_at
    FROM alerts a
  `;
  const params = [];

  if (acknowledged !== null) {
    sql += ` WHERE a.acknowledged = $1`;
    params.push(acknowledged);
  }

  sql += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query(sql, params);
  return result.rows;
};

export const acknowledgeAlert = async (id, by = 'system') => {
  const result = await query(`
    UPDATE alerts
    SET acknowledged = true, acknowledged_at = NOW(), acknowledged_by = $2
    WHERE id = $1
    RETURNING *
  `, [id, by]);
  return result.rows[0] || null;
};

export const getUnreadCount = async () => {
  const result = await query(`SELECT COUNT(*) FROM alerts WHERE acknowledged = false`);
  return parseInt(result.rows[0].count);
};
