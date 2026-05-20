
import React, { useMemo } from 'react';
import SensorTable from '../SensorTable';
import { motion } from 'framer-motion';
import { Shield, BatteryWarning, List, ArrowLeft } from 'lucide-react';

const SensorsView = ({ sensors, filter, batteryThreshold, onBack, theme = 'dark' }) => {
    const isLight = theme === 'light';

    const filteredSensors = useMemo(() => {
        switch (filter) {
            case 'critical':
                return sensors.filter(s => s.status === 'CRITICAL');
            case 'low_battery':
                return sensors.filter(s => (s.battery_level ?? s.battery ?? 100) <= batteryThreshold);
            case 'all':
            default:
                return sensors;
        }
    }, [sensors, filter, batteryThreshold]);

    const getHeaderInfo = () => {
        switch (filter) {
            case 'critical':
                return {
                    title: 'Sensores en Estado Crítico',
                    icon: <Shield className="text-neon-red animate-pulse" size={28} />,
                    color: 'text-neon-red'
                };
            case 'low_battery':
                return {
                    title: `Sensores con Batería Baja (<${batteryThreshold}%)`,
                    icon: <BatteryWarning className="text-neon-yellow" size={28} />,
                    color: 'text-neon-yellow'
                };
            default:
                return {
                    title: 'Listado Completo de Sensores',
                    icon: <List className="text-neon-green" size={28} />,
                    color: 'text-neon-green'
                };
        }
    };

    const header = getHeaderInfo();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2 rounded-lg border transition-colors ${isLight ? 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className={`text-2xl font-bold flex items-center gap-3 ${header.color}`}>
                        {header.icon}
                        {header.title}
                    </h2>
                </div>

                {(filter === 'critical' || filter === 'low_battery') && (
                    <button
                        onClick={() => {
                            let currentLoc = { lat: 37.3891, lng: -5.9845 };
                            let unvisited = [...filteredSensors];
                            let route = [];

                            while (unvisited.length > 0) {
                                let nearest = null;
                                let minDist = Infinity;
                                let nearestIndex = -1;

                                unvisited.forEach((sensor, index) => {
                                    const dist = Math.sqrt(
                                        Math.pow(sensor.lat - currentLoc.lat, 2) +
                                        Math.pow(sensor.lng - currentLoc.lng, 2)
                                    );
                                    if (dist < minDist) {
                                        minDist = dist;
                                        nearest = sensor;
                                        nearestIndex = index;
                                    }
                                });

                                if (nearest) {
                                    route.push(nearest);
                                    currentLoc = { lat: nearest.lat, lng: nearest.lng };
                                    unvisited.splice(nearestIndex, 1);
                                }
                            }

                            if (route.length > 0) {
                                const baseUrl = "https://www.google.com/maps/dir/";
                                const waypoints = route.map(s => `${s.lat},${s.lng}`).join('/');
                                const url = `${baseUrl}My+Location/${waypoints}`;
                                window.open(url, '_blank');
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold shadow-lg shadow-blue-900/20"
                    >
                        <Shield size={18} />
                        Exportar Ruta Optima
                    </button>
                )}
            </div>

            <div className={`rounded-xl border p-6 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                {filteredSensors.length > 0 ? (
                    <SensorTable sensors={filteredSensors} hasActionColumn theme={theme} />
                ) : (
                    <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        No se encontraron sensores con este criterio.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SensorsView;
