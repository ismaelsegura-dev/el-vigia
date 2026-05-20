import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Shield, Volume2, Save, ArrowLeft } from 'lucide-react';

const SettingsView = ({ batteryThreshold, setBatteryThreshold, onBack, theme = 'dark' }) => {
    const isLight = theme === 'light';

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
                    className={`p-2 rounded-lg border transition-colors ${isLight ? 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    <span className="w-1 h-8 bg-neon-yellow/50 rounded-full"></span>
                    Configuracion del Sistema
                </h2>
            </div>

            <Section title="Notificaciones y Alertas" icon={<Bell className="text-neon-yellow" />} theme={theme}>
                <Toggle label="Activar Alertas Sonoras (Sirena)" defaultChecked={true} theme={theme} />
                <Toggle label="Notificaciones Push al Operario" defaultChecked={true} theme={theme} />
                <Toggle label="Enviar Reportes Diarios por Email" defaultChecked={false} theme={theme} />
            </Section>

            <Section title="Umbrales de Sensores" icon={<Shield className="text-neon-red" />} theme={theme}>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Nivel de Agua Critico (%)</label>
                            <span className="text-neon-red font-bold">85%</span>
                        </div>
                        <input type="range" className="w-full accent-neon-red bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer" min="50" max="100" defaultValue="85" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Advertencia de Bateria Baja (%)</label>
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

            <Section title="Interfaz" icon={<Moon className="text-blue-400" />} theme={theme}>
                <Toggle label="Modo Oscuro" defaultChecked={theme === 'dark'} disabled />
                <Toggle label="Animaciones Reducidas" defaultChecked={false} theme={theme} />
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

const Section = ({ title, icon, children, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className={`p-6 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
            <h3 className={`text-lg font-semibold mb-6 flex items-center gap-3 border-b pb-3 ${isLight ? 'text-slate-800 border-slate-200' : 'text-white border-slate-700'}`}>
                {icon} {title}
            </h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};

const Toggle = ({ label, defaultChecked, disabled, theme = 'dark' }) => {
    const isLight = theme === 'light';
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className="flex items-center justify-between">
            <span className={`${isLight ? 'text-slate-600' : 'text-slate-300'} ${disabled ? 'opacity-50' : ''}`}>{label}</span>
            <button
                onClick={() => !disabled && setChecked(!checked)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${checked ? 'bg-neon-green' : isLight ? 'bg-slate-300' : 'bg-slate-600'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
};

export default SettingsView;
