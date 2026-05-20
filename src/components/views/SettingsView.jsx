import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Shield, Save, ArrowLeft, Check } from 'lucide-react';

const DEFAULT_SETTINGS = {
  soundAlerts: true,
  pushNotifications: true,
  emailReports: false,
  criticalLevel: 85,
  batteryThreshold: 20,
  reducedAnimations: false,
};

const SettingsView = ({ batteryThreshold, setBatteryThreshold, onBack, theme = 'dark' }) => {
    const isLight = theme === 'light';
    const [settings, setSettings] = useState(() => {
      const saved = localStorage.getItem('vigia-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
      setBatteryThreshold(settings.batteryThreshold);
    }, [settings.batteryThreshold, setBatteryThreshold]);

    const updateSetting = (key, value) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      setSaved(false);
    };

    const handleSave = () => {
      localStorage.setItem('vigia-settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    };

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
                <Toggle label="Activar Alertas Sonoras (Sirena)" checked={settings.soundAlerts} onChange={(v) => updateSetting('soundAlerts', v)} theme={theme} />
                <Toggle label="Notificaciones Push al Operario" checked={settings.pushNotifications} onChange={(v) => updateSetting('pushNotifications', v)} theme={theme} />
                <Toggle label="Enviar Reportes Diarios por Email" checked={settings.emailReports} onChange={(v) => updateSetting('emailReports', v)} theme={theme} />
            </Section>

            <Section title="Umbrales de Sensores" icon={<Shield className="text-neon-red" />} theme={theme}>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Nivel de Agua Critico (%)</label>
                            <span className="text-neon-red font-bold">{settings.criticalLevel}%</span>
                        </div>
                        <input
                            type="range"
                            className="w-full accent-neon-red bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
                            min="50"
                            max="100"
                            value={settings.criticalLevel}
                            onChange={(e) => updateSetting('criticalLevel', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Advertencia de Bateria Baja (%)</label>
                            <span className="text-neon-yellow font-bold">{settings.batteryThreshold}%</span>
                        </div>
                        <input
                            type="range"
                            className="w-full accent-neon-yellow bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
                            min="5"
                            max="50"
                            value={settings.batteryThreshold}
                            onChange={(e) => updateSetting('batteryThreshold', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Interfaz" icon={<Moon className="text-blue-400" />} theme={theme}>
                <Toggle label="Animaciones Reducidas" checked={settings.reducedAnimations} onChange={(v) => updateSetting('reducedAnimations', v)} theme={theme} />
            </Section>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-all font-bold ${
                      saved
                        ? 'bg-green-500/20 border-green-500 text-green-500'
                        : 'bg-neon-green/20 text-neon-green border-neon-green hover:bg-neon-green hover:text-black'
                    }`}
                >
                    {saved ? <Check size={18} /> : <Save size={18} />}
                    {saved ? 'Guardado!' : 'Guardar Cambios'}
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

const Toggle = ({ label, checked, onChange, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className="flex items-center justify-between">
            <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${checked ? 'bg-neon-green' : isLight ? 'bg-slate-300' : 'bg-slate-600'}`}
            >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );
};

export default SettingsView;
