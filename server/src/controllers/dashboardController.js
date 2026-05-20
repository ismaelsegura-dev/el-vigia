import { query } from '../db/index.js';

export const getDashboardKPIs = async () => {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE s.is_active = true) AS active_sensors,
      COUNT(*) FILTER (WHERE COALESCE(r.level, 0) >= 80) AS critical_alerts,
      ROUND(AVG(s.battery_level)) AS avg_battery
    FROM sensors s
    LEFT JOIN LATERAL (
      SELECT level FROM sensor_readings
      WHERE sensor_id = s.id
      ORDER BY received_at DESC
      LIMIT 1
    ) r ON true
  `);
  return result.rows[0];
};

export const getSensorStatusSummary = async () => {
  const result = await query(`
    SELECT
      COUNT(*) FILTER (WHERE COALESCE(r.level, 0) < 60) AS ok,
      COUNT(*) FILTER (WHERE COALESCE(r.level, 0) >= 60 AND COALESCE(r.level, 0) < 80) AS warning,
      COUNT(*) FILTER (WHERE COALESCE(r.level, 0) >= 80) AS critical
    FROM sensors s
    LEFT JOIN LATERAL (
      SELECT level FROM sensor_readings
      WHERE sensor_id = s.id
      ORDER BY received_at DESC
      LIMIT 1
    ) r ON true
    WHERE s.is_active = true
  `);
  return result.rows[0];
};

export const getRecentReadings = async (hours = 24) => {
  const result = await query(`
    SELECT
      sensor_id,
      level,
      received_at
    FROM sensor_readings
    WHERE received_at > NOW() - ($1 || ' hours')::INTERVAL
    ORDER BY received_at ASC
  `, [hours]);
  return result.rows;
};
