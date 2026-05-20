import React from 'react';
import { AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertsFeed = ({ alerts, onAlertClick, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className="space-y-3 pr-2 h-full">
            <AnimatePresence>
                {alerts.map((alert, index) => (
                    <AlertItem key={alert.id} alert={alert} index={index} onClick={() => onAlertClick && onAlertClick(alert)} theme={theme} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const AlertItem = ({ alert, index, onClick, theme = 'dark' }) => {
    const isLight = theme === 'light';

    const getIcon = () => {
        switch (alert.type) {
            case 'critical': return <AlertCircle size={18} className="text-neon-red" />;
            case 'warning': return <AlertCircle size={18} className={isLight ? 'text-yellow-600' : 'text-neon-yellow'} />;
            case 'success': return <CheckCircle size={18} className="text-neon-green" />;
            default: return <Info size={18} className="text-blue-400" />;
        }
    };

    const getBorderColor = () => {
        switch (alert.type) {
            case 'critical': return isLight ? 'border-red-300 bg-red-50' : 'border-neon-red/40 bg-neon-red/5';
            case 'warning': return isLight ? 'border-yellow-300 bg-yellow-50' : 'border-neon-yellow/40 bg-neon-yellow/5';
            case 'success': return isLight ? 'border-green-300 bg-green-50' : 'border-neon-green/40 bg-neon-green/5';
            default: return isLight ? 'border-blue-300 bg-blue-50' : 'border-blue-400/30 bg-blue-400/5';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.1 }}
            className={`
      p-3 rounded-lg border border-l-4 ${getBorderColor()}
      transition-all duration-300 group
      ${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-700/50'}
      ${alert.sensorId ? 'cursor-pointer hover:shadow-lg' : ''}
    `}
            onClick={() => alert.sensorId && onClick()}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-1">
                    {getIcon()}
                    <span className={`text-xs font-mono flex items-center gap-1 ${isLight ? 'opacity-60 group-hover:opacity-100 text-slate-500' : 'opacity-70 group-hover:opacity-100'}`}>
                        <Clock size={10} /> {alert.time}
                    </span>
                </div>
            </div>
            <p className={`text-sm font-medium transition-colors ${isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white'}`}>
                {alert.message}
            </p>
        </motion.div>
    );
};

export default AlertsFeed;
