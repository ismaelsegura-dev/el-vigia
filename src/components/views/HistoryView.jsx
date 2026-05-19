
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const data = [
    { time: '00:00', sensor1: 20, sensor2: 15, sensor4: 80 },
    { time: '04:00', sensor1: 22, sensor2: 18, sensor4: 85 },
    { time: '08:00', sensor1: 25, sensor2: 24, sensor4: 90 },
    { time: '12:00', sensor1: 21, sensor2: 30, sensor4: 95 },
    { time: '16:00', sensor1: 18, sensor2: 25, sensor4: 92 },
    { time: '20:00', sensor1: 24, sensor2: 20, sensor4: 88 },
    { time: '24:00', sensor1: 22, sensor2: 18, sensor4: 82 },
];

const HistoryView = ({ onBack }) => {
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
                    Histórico de Niveles de Agua (24h)
                </h2>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSensor4" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSensor1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ff00" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                            </linearGradient>
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
                        <Area data={data} type="monotone" dataKey="sensor4" stroke="#ff0000" fillOpacity={1} fill="url(#colorSensor4)" name="Sensor #04 (Real)" stackId="1" />
                        <Area data={data} type="monotone" dataKey="sensor1" stroke="#00ff00" fillOpacity={1} fill="url(#colorSensor1)" name="Sensor #01 (Real)" stackId="2" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Predictive Chart Section */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Velocidad de Llenado y Proyección (30 min)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        { time: '-60m', velocity: 2.5, prediction: null },
                        { time: '-45m', velocity: 3.0, prediction: null },
                        { time: '-30m', velocity: 2.8, prediction: null },
                        { time: '-15m', velocity: 4.2, prediction: null },
                        { time: 'Ahora', velocity: 5.5, prediction: 5.5 }, // Anchor point
                        { time: '+15m', velocity: null, prediction: 7.2 },
                        { time: '+30m', velocity: null, prediction: 9.8 },
                    ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" label={{ value: 'cm/min', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        {/* Real Data Line */}
                        <Area type="monotone" dataKey="velocity" stroke="#ec4899" fillOpacity={1} fill="url(#colorVelocity)" name="Velocidad Real" />

                        {/* Prediction Line (Dashed) */}
                        <Area
                            type="monotone"
                            dataKey="prediction"
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            fillOpacity={0.3}
                            fill="url(#colorPrediction)"
                            name="Proyección IA"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Análisis Predictivo</h3>
                    <p className="text-slate-400 text-sm">Basado en los datos de las últimas 24h, se estima un desbordamiento en <span className="text-neon-red font-bold">C/ Mairena</span> en las próximas 2 horas si no se realiza mantenimiento.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold mb-2 text-slate-300">Eficiencia de Drenaje</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-neon-green">87%</div>
                        <div className="text-sm text-slate-400">El sistema está operando dentro de los parámetros esperados, excepto en zona crítica.</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HistoryView;
