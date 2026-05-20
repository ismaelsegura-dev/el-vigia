const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  health: () => fetchAPI('/health'),

  getSensors: () => fetchAPI('/sensors'),

  getSensor: (id) => fetchAPI(`/sensors/${id}`),

  getSensorHistory: (id, hours = 24) => fetchAPI(`/sensors/${id}/history?hours=${hours}`),

  getAlerts: (limit = 50) => fetchAPI(`/alerts?limit=${limit}`),

  getKPIs: () => fetchAPI('/dashboard/kpis'),

  getHistory: (hours = 24) => fetchAPI(`/dashboard/history?hours=${hours}`),

  getScores: (precipitationProb = 30) => fetchAPI(`/dashboard/scores?precipitation_prob=${precipitationProb}`),

  getRoute: (precipitationProb = 30, maxStops = 20) =>
    fetchAPI('/dashboard/route', {
      method: 'POST',
      body: JSON.stringify({ precipitation_prob: precipitationProb, max_stops: maxStops }),
    }),

  postReading: (data, secret) =>
    fetchAPI('/sensors/reading', {
      method: 'POST',
      headers: { 'x-sensor-secret': secret },
      body: JSON.stringify(data),
    }),
};
