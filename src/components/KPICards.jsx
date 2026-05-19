
import React from 'react';
import { Wifi, AlertTriangle, BatteryCharging } from 'lucide-react';
import { motion } from 'framer-motion';

const KPICards = ({ data, onActiveClick, onCriticalClick, onBatteryClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
                title="Sensores Activos"
                value={data.activeSensors}
                icon={<Wifi className="text-neon-green" size={24} />}
                trend="+2 nuevos"
                color="neon-green"
                delay={0}
                onClick={onActiveClick}
            />
            <Card
                title="Alertas Críticas"
                value={data.criticalAlerts}
                icon={<AlertTriangle className="text-neon-red animate-pulse" size={24} />}
                trend="Requiere atención"
                trendColor="text-neon-red"
                color="neon-red"
                isAlert
                delay={0.1}
                onClick={onCriticalClick}
            />
            <Card
                title="Batería Media"
                value={`${data.avgBattery}%`}
                icon={<BatteryCharging className="text-neon-yellow" size={24} />}
                trend="-1% vs ayer"
                trendColor="text-slate-400"
                color="neon-yellow"
                delay={0.2}
                onClick={onBatteryClick}
            />
        </div>
    );
};

const Card = ({ title, value, icon, trend, trendColor = "text-neon-green", color, isAlert, delay, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            onClick={onClick}
            className={`
      relative overflow-hidden rounded-xl bg-slate-800 p-6 border border-slate-700
      hover:border-${color} transition-all duration-300 group cursor-pointer
      ${isAlert ? 'shadow-[0_0_15px_-5px_rgba(255,0,0,0.3)] border-neon-red/30' : ''}
    `}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(icon, { size: 64 })}
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-${color}/50 transition-colors`}>
                    {icon}
                </div>
                {isAlert && (
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-red"></span>
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-white mt-1 group-hover:text-neon-blue transition-colors">{value}</p>
                <p className={`text-xs mt-2 font-mono ${trendColor}`}>
                    {trend}
                </p>
            </div>

            {/* Decorative gradient line at bottom */}
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-${color}/0 via-${color} to-${color}/0 opacity-50`}></div>
        </motion.div>
    );
};

export default KPICards;
