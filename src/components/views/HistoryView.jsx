import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

const HistoryView = ({ sensors, onBack }) => {
  const [historyData, setHistoryData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const criticalSensors = sensors.filter(s => s.status === 'CRITICAL' || s.status === 'WARNING').slice(0, 3);
        const allHistory = [];

        for (const sensor of criticalSensors.length > 0 ? criticalSensors : sensors.slice(0, 3)) {
          const res = await api.getSensorHistory(sensor.id, 24);
          res.data.forEach(entry => {
            allHistory.push({
              sensor_id: sensor.id,
              location: sensor.location_name,
              level: entry.level,
              time: new Date(entry.received_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(entry.received_at),
            });
          });
        }

        const merged = {};
        allHistory.forEach(entry => {
          if (!merged[entry.time]) {
            merged[entry.time] = { time: entry.time };
          }
          merged[entry.time][`sensor_${entry.sensor_id}`] = entry.level;
        });

        setHistoryData(Object.values(merged).sort((a, b) => {
          const timeA = new Date('2000-01-01 ' + a.time);
          const timeB = new Date('2000-01-01 ' + b.time);
          return timeA - timeB;
        }));

        const criticalSensor = sensors.find(s => s.status === 'CRITICAL') || sensors[0];
        if (criticalSensor) {
          const readings = await api.getSensorHistory(criticalSensor.id, 2);
          const readingsData = readings.data.map(r => ({
            level: r.level,
            time: new Date(r.received_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(r.received_at),
          }));

          if (readingsData.length >= 2) {
            const recent = readingsData.slice(-5);
            const lastLevel = recent[recent.length - 1].level;
            const firstLevel = recent[0].level;
            const trend = (lastLevel - firstLevel) / recent.length;

            const prediction = [...recent];
            for (let i = 1; i <= 6; i++) {
              const futureTime = new Date();
              futureTime.setMinutes(futureTime.getMinutes() + i * 15);
              prediction.push({
                level: null,
                prediction: Math.min(100, Math.max(0, Math.round(lastLevel + trend * i))),
                time: futureTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                timestamp: futureTime,
              });
            }
            setPredictionData(prediction);
          }
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sensors.length > 0) {
      fetchHistory();
    }
  }, [sensors]);

  const criticalSensor = sensors.find(s => s.status === 'CRITICAL');
  const sensorNames = [...new Set(historyData.flatMap(d =>
    Object.keys(d).filter(k => k.startsWith('sensor_')).map(k => {
      const id = k.replace('sensor_', '');
      const sensor = sensors.find(s => s.id === id);
      return sensor ? `#${id} ${sensor.location_name}` : `#${id}`;
    })
  ))];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-neon-green/50 rounded-full"></span>
          Historico de Niveles de Agua (24h)
        </h2>
      </div>

      {loading ? (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-[400px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {historyData.length > 0 && Object.keys(historyData[0])
                  .filter(k => k.startsWith('sensor_'))
                  .map((key, i) => {
                    const colors = ['#ff0000', '#00ff00', '#ffff00', '#3b82f6', '#ec4899', '#8b5cf6'];
                    const color = colors[i % colors.length];
                    return (
                      <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    );
                  })}
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              {historyData.length > 0 && Object.keys(historyData[0])
                .filter(k => k.startsWith('sensor_'))
                .map((key, i) => {
                  const colors = ['#ff0000', '#00ff00', '#ffff00', '#3b82f6', '#ec4899', '#8b5cf6'];
                  const color = colors[i % colors.length];
                  const id = key.replace('sensor_', '');
                  const sensor = sensors.find(s => s.id === id);
                  return (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      fillOpacity={1}
                      fill={`url(#color${key})`}
                      name={`#${id} ${sensor?.location_name || ''}`}
                    />
                  );
                })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-[400px]">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Velocidad de Llenado y Proyeccion (30 min)
          {criticalSensor && <span className="text-sm text-slate-400 font-normal">- Sensor #{criticalSensor.id} ({criticalSensor.location_name})</span>}
        </h3>
        {predictionData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="level" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} name="Nivel Real" />
              <Line type="monotone" dataKey="prediction" stroke="#3b82f6" strokeDasharray="5 5" dot={{ r: 4 }} fill="url(#colorPrediction)" name="Proyeccion" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Datos insuficientes para generar proyeccion
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Analisis Predictivo</h3>
          {criticalSensor ? (
            <p className="text-slate-400 text-sm">
              El sensor <span className="text-neon-red font-bold">#{criticalSensor.id} ({criticalSensor.location_name})</span> esta en estado critico con un nivel del {criticalSensor.current_level}%.
              Se recomienda mantenimiento inmediato.
            </p>
          ) : (
            <p className="text-slate-400 text-sm">Todos los sensores operan dentro de parametros normales.</p>
          )}
        </div>
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Sensores Activos</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-neon-green">{sensors.length}</div>
            <div className="text-sm text-slate-400">
              {sensors.filter(s => s.status === 'OK').length} OK, {sensors.filter(s => s.status === 'WARNING').length} alerta, {sensors.filter(s => s.status === 'CRITICAL').length} critico
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryView;
