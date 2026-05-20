import { query } from '../db/index.js';

const AEMET_API_KEY = process.env.AEMET_API_KEY;
const SEVILLA_MUNICIPIO_ID = '41091';

async function aemetRequest(endpoint) {
  const res = await fetch(`https://opendata.aemet.es/opendata/api${endpoint}`, {
    headers: { 'api_key': AEMET_API_KEY },
  });

  if (!res.ok) throw new Error(`AEMET API error: ${res.status}`);

  const data = await res.json();

  if (data.estado === 200 && data.datos) {
    const forecastRes = await fetch(data.datos);
    if (!forecastRes.ok) throw new Error(`AEMET data fetch error: ${forecastRes.status}`);
    return await forecastRes.json();
  }

  throw new Error(data.descripcion || 'AEMET request failed');
}

function parseAemetValue(entry) {
  if (typeof entry === 'number') return entry;
  if (typeof entry === 'object' && entry !== null) return parseFloat(entry.value) || 0;
  return parseFloat(entry) || 0;
}

function getSkyDescription(skyData) {
  if (!skyData) return 'Despejado';
  const values = Array.isArray(skyData) ? skyData : [skyData];
  const skyValues = values.map(v => parseAemetValue(v));
  const avgSky = skyValues.reduce((a, b) => a + b, 0) / skyValues.length;

  if (avgSky <= 15) return 'Despejado';
  if (avgSky <= 30) return 'Poco nuboso';
  if (avgSky <= 60) return 'Intervalos nubosos';
  if (avgSky <= 80) return 'Nublado';
  return 'Muy nuboso';
}

function buildDescription(skyData, precipProb) {
  const sky = getSkyDescription(skyData);
  const maxProb = Array.isArray(precipProb)
    ? Math.max(...precipProb.map(p => parseAemetValue(p)))
    : parseAemetValue(precipProb);

  if (maxProb >= 70) return 'Lluvia';
  if (maxProb >= 40) return `${sky} con lluvia posible`;
  return sky;
}

export const fetchAndStoreForecast = async () => {
  if (!AEMET_API_KEY) {
    console.warn('AEMET_API_KEY no configurada, usando datos simulados');
    return generateMockForecast();
  }

  try {
    const forecast = await aemetRequest(`/prediccion/especifica/municipio/diaria/${SEVILLA_MUNICIPIO_ID}`);

    if (!Array.isArray(forecast)) throw new Error('Formato de prediccion inesperado');

    const data = forecast[0];
    const stored = [];

    for (const dia of data.prediccion.dia) {
      const precipValues = dia.precipitacion?.map(p => parseAemetValue(p)) || [];
      const precipitacion = precipValues.reduce((a, b) => a + b, 0);

      const probValues = dia.probPrecipitacion?.map(p => parseAemetValue(p)) || [];
      const probPrecipitacion = probValues.length > 0 ? Math.max(...probValues) : 0;

      const tempMin = parseFloat(dia.temperatura?.minima || 0);
      const tempMax = parseFloat(dia.temperatura?.maxima || 0);

      const windValues = dia.viento?.map(v => parseAemetValue(v)) || [];
      const vientoMax = windValues.length > 0 ? Math.max(...windValues) : 0;

      const description = buildDescription(dia.cieloNubosidad || dia.estadoCielo, dia.probPrecipitacion);

      const dateStr = dia.fecha.includes('T')
        ? dia.fecha.substring(0, 10)
        : dia.fecha;

      const result = await query(`
        INSERT INTO weather_data (city_id, forecast_date, precipitation_mm, precipitation_prob, temperature_min, temperature_max, wind_speed, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (city_id, forecast_date) DO UPDATE SET
          precipitation_mm = EXCLUDED.precipitation_mm,
          precipitation_prob = EXCLUDED.precipitation_prob,
          temperature_min = EXCLUDED.temperature_min,
          temperature_max = EXCLUDED.temperature_max,
          wind_speed = EXCLUDED.wind_speed,
          description = EXCLUDED.description,
          fetched_at = NOW()
        RETURNING *
      `, [
        SEVILLA_MUNICIPIO_ID,
        dateStr,
        parseFloat(precipitacion.toFixed(1)),
        Math.round(probPrecipitacion),
        tempMin,
        tempMax,
        vientoMax,
        description,
      ]);

      stored.push(result.rows[0]);
    }

    console.log(`AEMET: ${stored.length} dias de prediccion guardados`);
    return stored;
  } catch (err) {
    console.error('Error obteniendo datos AEMET:', err.message);
    return generateMockForecast();
  }
};

export const getForecast = async () => {
  const result = await query(`
    SELECT
      city_id,
      forecast_date::text AS forecast_date,
      precipitation_mm,
      precipitation_prob,
      temperature_min,
      temperature_max,
      wind_speed,
      description,
      fetched_at::text AS fetched_at
    FROM weather_data
    WHERE city_id = $1 AND forecast_date >= CURRENT_DATE
    ORDER BY forecast_date ASC
    LIMIT 7
  `, [SEVILLA_MUNICIPIO_ID]);

  if (result.rows.length === 0) {
    return generateMockForecast();
  }

  return result.rows;
};

export const getCurrentPrecipitationProb = async () => {
  const forecast = await getForecast();
  if (forecast.length === 0) return 30;
  return parseInt(forecast[0].precipitation_prob) || 30;
};

function generateMockForecast() {
  const days = [];
  const conditions = [
    { desc: 'Parcialmente nublado', precip: 2.5, prob: 30, tempMin: 18, tempMax: 32, wind: 15 },
    { desc: 'Nublado con lluvia', precip: 12.0, prob: 75, tempMin: 16, tempMax: 26, wind: 25 },
    { desc: 'Despejado', precip: 0, prob: 5, tempMin: 20, tempMax: 35, wind: 10 },
    { desc: 'Tormenta', precip: 25.0, prob: 90, tempMin: 14, tempMax: 22, wind: 40 },
    { desc: 'Intervalos nubosos', precip: 1.0, prob: 20, tempMin: 19, tempMax: 30, wind: 12 },
  ];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const cond = conditions[i % conditions.length];

    days.push({
      city_id: SEVILLA_MUNICIPIO_ID,
      forecast_date: date.toISOString().split('T')[0],
      precipitation_mm: cond.precip,
      precipitation_prob: cond.prob,
      temperature_min: cond.tempMin,
      temperature_max: cond.tempMax,
      wind_speed: cond.wind,
      description: cond.desc,
      fetched_at: new Date().toISOString(),
    });
  }

  return days;
}
