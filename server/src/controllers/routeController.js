import { query } from '../db/index.js';
import { getLevelTrend } from './sensorController.js';

export const calculateScores = async (precipitationProb = 30) => {
  const sensors = await query(`
    SELECT id, battery_level FROM sensors WHERE is_active = true
  `);

  const scores = [];
  for (const sensor of sensors.rows) {
    const lastReading = await query(`
      SELECT level FROM sensor_readings
      WHERE sensor_id = $1
      ORDER BY received_at DESC
      LIMIT 1
    `, [sensor.id]);

    const level = lastReading.rows[0]?.level || 0;
    const trend = await getLevelTrend(sensor.id);

    const result = await query(`
      SELECT calculate_sensor_score($1, $2, $3, $4, $5) AS score
    `, [sensor.id, level, sensor.battery_level, precipitationProb, trend]);

    scores.push({
      sensor_id: sensor.id,
      score: parseFloat(result.rows[0].score),
      level,
      trend,
    });
  }

  return scores.sort((a, b) => b.score - a.score);
};

export const getOptimalRoute = async (precipitationProb = 30, maxStops = 20) => {
  const scores = await calculateScores(precipitationProb);
  const criticalSensors = scores.filter(s => s.score >= 30).slice(0, maxStops);

  if (criticalSensors.length === 0) return null;

  const sensorDetails = await query(`
    SELECT id, location_name, lat, lng FROM sensors WHERE id = ANY($1)
  `, [criticalSensors.map(s => s.sensor_id)]);

  const sensorMap = {};
  sensorDetails.rows.forEach(s => {
    sensorMap[s.id] = s;
  });

  const stops = nearestNeighbor(criticalSensors.map(s => ({
    ...s,
    ...sensorMap[s.sensor_id],
  })));

  const route = await query(`
    INSERT INTO cleaning_routes (name, total_sensors, status)
    VALUES ($1, $2, 'pending')
    RETURNING id
  `, [`Ruta ${new Date().toLocaleDateString('es-ES')} - ${stops.length} paradas`, stops.length]);

  const routeId = route.rows[0].id;

  for (let i = 0; i < stops.length; i++) {
    await query(`
      INSERT INTO route_stops (route_id, sensor_id, stop_order, score)
      VALUES ($1, $2, $3, $4)
    `, [routeId, stops[i].sensor_id, i + 1, stops[i].score]);
  }

  const totalDistance = calculateTotalDistance(stops);

  await query(`
    UPDATE cleaning_routes SET estimated_distance_km = $2 WHERE id = $1
  `, [routeId, totalDistance]);

  return {
    id: routeId,
    name: `Ruta ${new Date().toLocaleDateString('es-ES')}`,
    stops,
    totalDistance,
    estimatedTimeMin: Math.round(totalDistance * 3 + stops.length * 10),
  };
};

function nearestNeighbor(sensors) {
  if (sensors.length <= 1) return sensors;

  const sorted = [...sensors].sort((a, b) => b.score - a.score);
  const route = [sorted[0]];
  const remaining = sorted.slice(1);

  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(last.lat, last.lng, remaining[i].lat, remaining[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    route.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return route;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateTotalDistance(stops) {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversine(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
  }
  return parseFloat(total.toFixed(2));
}
