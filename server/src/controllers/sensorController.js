import { query } from '../db/index.js';

export const getAllSensors = async () => {
  const result = await query(`
    SELECT
      s.id,
      s.location_name,
      s.lat,
      s.lng,
      s.battery_level,
      s.firmware_version,
      s.installed_at,
      s.last_seen,
      s.is_active,
      COALESCE(r.level, 0) AS current_level,
      CASE
        WHEN COALESCE(r.level, 0) >= 80 THEN 'CRITICAL'
        WHEN COALESCE(r.level, 0) >= 60 THEN 'WARNING'
        ELSE 'OK'
      END AS status,
      EXTRACT(EPOCH FROM (NOW() - s.last_seen)) / 60 AS minutes_since_last_seen
    FROM sensors s
    LEFT JOIN LATERAL (
      SELECT level FROM sensor_readings
      WHERE sensor_id = s.id
      ORDER BY received_at DESC
      LIMIT 1
    ) r ON true
    WHERE s.is_active = true
    ORDER BY s.id
  `);
  return result.rows;
};

export const getSensorById = async (id) => {
  const result = await query(`
    SELECT
      s.*,
      COALESCE(r.level, 0) AS current_level
    FROM sensors s
    LEFT JOIN LATERAL (
      SELECT level FROM sensor_readings
      WHERE sensor_id = s.id
      ORDER BY received_at DESC
      LIMIT 1
    ) r ON true
    WHERE s.id = $1
  `, [id]);
  return result.rows[0] || null;
};

export const getSensorHistory = async (id, hours = 24) => {
  const result = await query(`
    SELECT level, humidity, battery, temperature, received_at
    FROM sensor_readings
    WHERE sensor_id = $1
      AND received_at > NOW() - ($2 || ' hours')::INTERVAL
    ORDER BY received_at ASC
  `, [id, hours]);
  return result.rows;
};

export const getSensorReadings = async (id, limit = 100) => {
  const result = await query(`
    SELECT level, humidity, battery, temperature, received_at, signal_strength
    FROM sensor_readings
    WHERE sensor_id = $1
    ORDER BY received_at DESC
    LIMIT $2
  `, [id, limit]);
  return result.rows;
};

export const insertReading = async (data) => {
  const { sensor_id, level, humidity, battery, temperature, signal_strength, raw_payload } = data;
  const result = await query(`
    INSERT INTO sensor_readings (sensor_id, level, humidity, battery, temperature, signal_strength, raw_payload)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, received_at
  `, [sensor_id, level, humidity || null, battery || null, temperature || null, signal_strength || null, raw_payload ? JSON.stringify(raw_payload) : null]);
  return result.rows[0];
};

export const getLevelTrend = async (sensorId, hours = 6) => {
  const result = await query(`
    SELECT
      AVG(level) FILTER (WHERE received_at > NOW() - ($2 || ' hours')::INTERVAL / 2) AS recent_avg,
      AVG(level) FILTER (WHERE received_at <= NOW() - ($2 || ' hours')::INTERVAL / 2
                          AND received_at > NOW() - ($2 || ' hours')::INTERVAL) AS older_avg
    FROM sensor_readings
    WHERE sensor_id = $1
      AND received_at > NOW() - ($2 || ' hours')::INTERVAL
  `, [sensorId, hours]);

  const row = result.rows[0];
  if (!row.recent_avg || !row.older_avg) return 0;
  return parseFloat(row.recent_avg) - parseFloat(row.older_avg);
};
