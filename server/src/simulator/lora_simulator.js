import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SENSOR_SECRET = process.env.SENSOR_API_SECRET || 'tu_clave_secreta_aqui';
const INTERVAL_MS = parseInt(process.env.SIM_INTERVAL_MS) || 10000;

const SENSORS = [
  { id: '01', baseLevel: 45, baseBattery: 92, lat: 37.3891, lng: -5.9845 },
  { id: '02', baseLevel: 32, baseBattery: 88, lat: 37.3850, lng: -5.9900 },
  { id: '03', baseLevel: 28, baseBattery: 95, lat: 37.3820, lng: -5.9930 },
  { id: '04', baseLevel: 95, baseBattery: 12, lat: 37.3870, lng: -5.9810 },
  { id: '05', baseLevel: 60, baseBattery: 78, lat: 37.4000, lng: -5.9950 },
  { id: '06', baseLevel: 15, baseBattery: 99, lat: 37.3840, lng: -6.0020 },
  { id: '07', baseLevel: 35, baseBattery: 85, lat: 37.3830, lng: -5.9920 },
  { id: '08', baseLevel: 42, baseBattery: 65, lat: 37.4030, lng: -5.9890 },
  { id: '09', baseLevel: 20, baseBattery: 90, lat: 37.3790, lng: -5.9900 },
  { id: '10', baseLevel: 55, baseBattery: 72, lat: 37.3880, lng: -5.9930 },
  { id: '11', baseLevel: 30, baseBattery: 88, lat: 37.3920, lng: -6.0010 },
  { id: '12', baseLevel: 78, baseBattery: 15, lat: 37.3800, lng: -5.9750 },
];

const state = {};
SENSORS.forEach(s => {
  state[s.id] = { level: s.baseLevel, battery: s.baseBattery };
});

function fluctuate(value, min, max, step) {
  const change = (Math.random() - 0.45) * step;
  const newVal = value + change;
  return Math.max(min, Math.min(max, Math.round(newVal)));
}

async function sendSensorData(sensor) {
  const s = state[sensor.id];

  s.level = fluctuate(s.level, 0, 100, 5);
  s.battery = fluctuate(s.battery, 0, 100, 0.5);

  const humidity = 40 + Math.random() * 50;
  const temperature = 15 + Math.random() * 20;
  const signalStrength = -120 + Math.random() * 40;

  const payload = {
    sensor_id: sensor.id,
    level: s.level,
    humidity: parseFloat(humidity.toFixed(1)),
    battery: s.battery,
    temperature: parseFloat(temperature.toFixed(1)),
    signal_strength: Math.round(signalStrength),
    lat: sensor.lat,
    lng: sensor.lng,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(`${API_URL}/api/sensors/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sensor-secret': SENSOR_SECRET,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const status = res.ok ? 'OK' : 'FAIL';
    console.log(`[${new Date().toLocaleTimeString()}] Sensor #${sensor.id} -> ${status} (level: ${s.level}%, battery: ${s.battery}%)`);

    if (!res.ok) {
      console.error(`  Error: ${data.error}`);
    }
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Sensor #${sensor.id} -> ERROR: ${err.message}`);
  }
}

async function runSimulation() {
  console.log('=== Simulador LoRaWAN de El Vigia ===');
  console.log(`API: ${API_URL}`);
  console.log(`Sensores: ${SENSORS.length}`);
  console.log(`Intervalo: ${INTERVAL_MS / 1000}s`);
  console.log('=====================================\n');

  for (const sensor of SENSORS) {
    await sendSensorData(sensor);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nEsperando ${INTERVAL_MS / 1000}s para la siguiente ronda...\n`);
}

setInterval(runSimulation, INTERVAL_MS);
runSimulation();
