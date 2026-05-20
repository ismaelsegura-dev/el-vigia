import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, BatteryWarning, Map, Activity, TrendingUp, HelpCircle, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

const HelpView = ({ onBack, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-12"
        >
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-lg border transition-colors ${isLight ? 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                    Centro de Ayuda y Documentacion
                </h2>
            </div>

            <div className={`p-8 rounded-xl border relative overflow-hidden ${isLight ? 'bg-gradient-to-r from-slate-100 to-white border-slate-200' : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen size={120} className={isLight ? 'text-slate-800' : 'text-white'} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isLight ? 'text-slate-800' : 'text-white'}`}>Bienvenido a VIGIA SYSTEM v1.0</h3>
                <p className={`max-w-2xl leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    Este sistema permite la monitorizacion en tiempo real del alcantarillado de la ciudad.
                    Utiliza una red de sensores IoT para detectar niveles de agua, estado de baterias y posibles desbordamientos.
                    A continuacion, encontraras una guia rapida para entender los indicadores y herramientas disponibles.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                    icon={<CheckCircle className="text-neon-green" size={32} />}
                    title="Estado Normal (OK)"
                    color={isLight ? 'border-green-300 bg-green-50' : 'border-neon-green/30 bg-neon-green/5'}
                    description="El sensor funciona correctamente y el nivel de agua esta dentro de los parametros seguros (<75%)."
                    theme={theme}
                />
                <StatusCard
                    icon={<AlertTriangle className="text-neon-yellow" size={32} />}
                    title="Advertencia / Bateria"
                    color={isLight ? 'border-yellow-300 bg-yellow-50' : 'border-neon-yellow/30 bg-neon-yellow/5'}
                    description="El sensor requiere atencion. Puede ser por nivel de agua alto (75-90%) o bateria baja (<20%)."
                    theme={theme}
                />
                <StatusCard
                    icon={<Shield className="text-neon-red" size={32} />}
                    title="Alerta Critica"
                    color={isLight ? 'border-red-300 bg-red-50' : 'border-neon-red/30 bg-neon-red/5'}
                    description="¡PELIGRO! Riesgo inminente de desbordamiento (>90%) o fallo critico del sensor. Requiere accion inmediata."
                    theme={theme}
                />
            </div>

            <h3 className={`text-xl font-bold mt-8 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                <HelpCircle size={20} className="text-blue-400" />
                Funcionalidades Clave
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard
                    icon={<Map className="text-purple-400" />}
                    title="Mapa Interactivo y Foco"
                    text="El mapa muestra la ubicacion exacta de todos los sensores. Al hacer clic en una 'Alerta Critica' desde el Dashboard, el mapa volara automaticamente y enfocara el sensor problematico."
                    theme={theme}
                />
                <FeatureCard
                    icon={<TrendingUp className="text-blue-400" />}
                    title="Prediccion de Llenado con IA"
                    text="En la vista de 'Historico', el sistema analiza la velocidad de subida del nivel de agua y proyecta una linea discontinua a 30 minutos vista. Util para anticiparse a inundaciones."
                    theme={theme}
                />
                <FeatureCard
                    icon={<Activity className="text-neon-green" />}
                    title="Ruta de Mantenimiento Optima"
                    text="En 'Estado de Sensores', si filtras por sensores Criticos o con Bateria Baja, aparecera un boton azul. Al pulsarlo, se generara la ruta mas rapida en Google Maps para visitar esos puntos."
                    theme={theme}
                />
                <FeatureCard
                    icon={<BatteryWarning className="text-neon-yellow" />}
                    title="Gestion Energetica"
                    text="Desde 'Configuracion', puedes ajustar el umbral de lo que consideras 'Bateria Baja'. Esto actualiza globalmente las alertas y filtros del sistema."
                    theme={theme}
                />
            </div>

            <div className={`p-6 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-white'}`}>Consejos Rapidos para Operarios</h3>
                <ul className={`space-y-3 text-sm list-disc pl-5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <li>Si un sensor deja de emitir señal por mas de 1 hora, aparecera en gris en el mapa (proximamente).</li>
                    <li>Utiliza la vista de <strong>"Historico"</strong> para verificar si una alerta es un pico puntual o una tendencia sostenida.</li>
                    <li>La <strong>Ruta Optima</strong> siempre comienza desde el centro de control (simulado en Plaza Nueva).</li>
                    <li>Recuerda revisar las baterias semanalmente usando el filtro de "Bateria Baja".</li>
                </ul>
            </div>

        </motion.div>
    );
};

const StatusCard = ({ icon, title, description, color, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className={`p-6 rounded-xl border flex flex-col gap-4 ${color}`}>
            <div className="flex items-center gap-3">
                {icon}
                <h4 className={`font-bold text-lg ${isLight ? 'text-slate-800' : 'text-white'}`}>{title}</h4>
            </div>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{description}</p>
        </div>
    );
};

const FeatureCard = ({ icon, title, text, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <div className={`p-5 rounded-lg border transition-colors ${isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
            <div className={`flex items-center gap-3 mb-3 font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                {icon}
                {title}
            </div>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{text}</p>
        </div>
    );
};

export default HelpView;
