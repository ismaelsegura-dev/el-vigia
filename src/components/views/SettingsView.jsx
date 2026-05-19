
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Shield, Volume2, Save, ArrowLeft } from 'lucide-react';

const SettingsView = ({ batteryThreshold, setBatteryThreshold, onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-8"
        >
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-8 bg-neon-yellow/50 rounded-full"></span>
                    Configuración del Sistema
                </h2>
            </div>

            {/* Notifications Section */}
            <Section title="Notificaciones y Alertas" icon={<Bell className="text-neon-yellow" />}>
                <Toggle label="Activar Alertas Sonoras (Sirena)" defaultChecked={true} />
                <Toggle label="Notificaciones Push al Operario" defaultChecked={true} />
                <Toggle label="Enviar Reportes Diarios por Email" defaultChecked={false} />
            </Section>

            {/* System Thresholds */}
            <Section title="Umbrales de Sensores" icon={<Shield className="text-neon-red" />}>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-slate-300 text-sm">Nivel de Agua Crítico (%)</label>
                            <span className="text-neon-red font-bold">85%</span>
                        </div>
                        <input type="range" className="w-full accent-neon-red bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer" min="50" max="100" defaultValue="85" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-slate-300 text-sm">Advertencia de Batería Baja (%)</label>
                            <span className="text-neon-yellow font-bold">{batteryThreshold}%</span>
                        </div>
                        <input
                            type="range"
                            className="w-full accent-neon-yellow bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
                            min="5"
                            max="50"
                            value={batteryThreshold}
                            onChange={(e) => setBatteryThreshold(parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </Section>

            {/* Interface */}
            <Section title="Interfaz" icon={<Moon className="text-blue-400" />}>
                <Toggle label="Modo Oscuro (Siempre activo)" defaultChecked={true} disabled />
                <Toggle label="Animaciones Reducidas" defaultChecked={false} />
            </Section>

            <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green rounded-lg hover:bg-neon-green hover:text-black transition-all font-bold">
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>

        </motion.div>
    );
};

const Section = ({ title, icon, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-white border-b border-slate-700 pb-3">
            {icon} {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Toggle = ({ label, defaultChecked, disabled }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between">
            <span className={`text-slate-300 ${disabled ? 'opacity-50' : ''}`}>{label}</span>
            <button
                onClick={() => !disabled && setChecked(!checked)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${checked ? 'bg-neon-green' : 'bg-slate-600'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
};

export default SettingsView;
