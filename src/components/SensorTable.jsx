import React from 'react';
import { Battery, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SensorTable = ({ sensors, onSensorClick, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className={`text-xs uppercase sticky top-0 ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-900/50 text-slate-400'}`}>
                    <tr>
                        <th className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>ID</th>
                        <th className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>Ubicacion</th>
                        <th className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>Nivel Agua</th>
                        <th className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>Bateria</th>
                        <th className={`p-4 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>Estado</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {sensors.map((sensor, index) => (
                        <TableRow key={sensor.id} sensor={sensor} index={index} onClick={() => onSensorClick && onSensorClick(sensor)} theme={theme} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TableRow = ({ sensor, index, onClick, theme = 'dark' }) => {
    const isLight = theme === 'light';
    const level = sensor.current_level ?? sensor.level ?? 0;
    const location = sensor.location_name ?? sensor.location ?? 'Desconocida';
    const battery = sensor.battery_level ?? sensor.battery ?? 0;
    const status = sensor.status ?? 'OK';
    const isCritical = status === 'CRITICAL';

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`
      border-b transition-colors cursor-pointer
      ${isLight
                    ? `border-slate-100 hover:bg-slate-50 ${isCritical ? 'bg-red-50/50' : ''}`
                    : `border-slate-800/50 hover:bg-slate-800/50 ${isCritical ? 'bg-neon-red/5' : ''}`
                }
    `}>
            <td className={`p-4 font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>#{sensor.id}</td>
            <td className={`p-4 font-medium ${isLight ? 'text-slate-800' : 'text-white'}`}>{location}</td>

            <td className="p-4">
                <div className="flex items-center gap-3">
                    <span className={`font-bold w-10 text-right ${getLevelColor(level)}`}>{level}%</span>
                    <div className={`w-24 h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-700'}`}>
                        <motion.div
                            className={`h-full rounded-full ${getBarColor(level)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${level}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        ></motion.div>
                    </div>
                </div>
            </td>

            <td className="p-4">
                <div className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    <Battery size={16} className={battery < 20 ? 'text-neon-red' : 'text-neon-green'} />
                    <span>{battery}%</span>
                </div>
            </td>

            <td className="p-4">
                <StatusBadge status={status} />
            </td>
        </motion.tr>
    );
};

const StatusBadge = ({ status }) => {
    let styles = "bg-slate-700 text-slate-300";
    let icon = <Activity size={14} />;

    if (status === 'OK') {
        styles = "bg-neon-green/10 text-neon-green border border-neon-green/20";
        icon = <CheckCircle size={14} />;
    } else if (status === 'WARNING') {
        styles = "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20";
        icon = <AlertTriangle size={14} />;
    } else if (status === 'CRITICAL') {
        styles = "bg-neon-red/10 text-neon-red border border-neon-red/20 animate-pulse";
        icon = <AlertTriangle size={14} />;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${styles}`}>
            {icon}
            {status}
        </span>
    );
};

const getLevelColor = (level) => {
    if (level > 80) return 'text-neon-red';
    if (level > 50) return 'text-neon-yellow';
    return 'text-neon-green';
};

const getBarColor = (level) => {
    if (level > 80) return 'bg-neon-red shadow-[0_0_8px_#ff0000]';
    if (level > 50) return 'bg-neon-yellow';
    return 'bg-neon-green shadow-[0_0_8px_#00ff00]';
};

export default SensorTable;
