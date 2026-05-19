
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, BatteryWarning, Map, Activity, TrendingUp, HelpCircle, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';

const HelpView = ({ onBack }) => {
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
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                    Centro de Ayuda y Documentación
                </h2>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-xl border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <BookOpen size={120} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Bienvenido a VIGÍA SYSTEM v1.0</h3>
                <p className="text-slate-300 max-w-2xl leading-relaxed">
                    Este sistema permite la monitorización en tiempo real del alcantarillado de la ciudad.
                    Utiliza una red de sensores IoT para detectar niveles de agua, estado de baterías y posibles desbordamientos.
                    A continuación, encontrarás una guía rápida para entender los indicadores y herramientas disponibles.
                </p>
            </div>

            {/* Legend Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                    icon={<CheckCircle className="text-neon-green" size={32} />}
                    title="Estado Normal (OK)"
                    color="border-neon-green/30 bg-neon-green/5"
                    description="El sensor funciona correctamente y el nivel de agua está dentro de los parámetros seguros (<75%)."
                />
                <StatusCard
                    icon={<AlertTriangle className="text-neon-yellow" size={32} />}
                    title="Advertencia / Batería"
                    color="border-neon-yellow/30 bg-neon-yellow/5"
                    description="El sensor requiere atención. Puede ser por nivel de agua alto (75-90%) o batería baja (<20%)."
                />
                <StatusCard
                    icon={<Shield className="text-neon-red" size={32} />}
                    title="Alerta Crítica"
                    color="border-neon-red/30 bg-neon-red/5"
                    description="¡PELIGRO! Riesgo inminente de desbordamiento (>90%) o fallo crítico del sensor. Requiere acción inmediata."
                />
            </div>

            {/* Features Guide */}
            <h3 className="text-xl font-bold text-white mt-8 flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-400" />
                Funcionalidades Clave
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard
                    icon={<Map className="text-purple-400" />}
                    title="Mapa Interactivo y Foco"
                    text="El mapa muestra la ubicación exacta de todos los sensores. Al hacer clic en una 'Alerta Crítica' desde el Dashboard, el mapa volará automáticamente y enfocará el sensor problemático."
                />
                <FeatureCard
                    icon={<TrendingUp className="text-blue-400" />}
                    title="Predicción de Llenado con IA"
                    text="En la vista de 'Histórico', el sistema analiza la velocidad de subida del nivel de agua y proyecta una línea discontinua a 30 minutos vista. Útil para anticiparse a inundaciones."
                />
                <FeatureCard
                    icon={<Activity className="text-neon-green" />}
                    title="Ruta de Mantenimiento Óptima"
                    text="En 'Estado de Sensores', si filtras por sensores Críticos o con Batería Baja, aparecerá un botón azul. Al pulsarlo, se generará la ruta más rápida en Google Maps para visitar esos puntos."
                />
                <FeatureCard
                    icon={<BatteryWarning className="text-neon-yellow" />}
                    title="Gestión Energética"
                    text="Desde 'Configuración', puedes ajustar el umbral de lo que consideras 'Batería Baja'. Esto actualiza globalmente las alertas y filtros del sistema."
                />
            </div>

            {/* FAQ / Quick Tips */}
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-white">Consejos Rápidos para Operarios</h3>
                <ul className="space-y-3 text-slate-400 text-sm list-disc pl-5">
                    <li>Si un sensor deja de emitir señal por más de 1 hora, aparecerá en gris en el mapa (próximamente).</li>
                    <li>Utiliza la vista de <strong>"Histórico"</strong> para verificar si una alerta es un pico puntual o una tendencia sostenida.</li>
                    <li>La <strong>Ruta Óptima</strong> siempre comienza desde el centro de control (simulado en Plaza Nueva).</li>
                    <li>Recuerda revisar las baterías semanalmente usando el filtro de "Batería Baja".</li>
                </ul>
            </div>

        </motion.div>
    );
};

const StatusCard = ({ icon, title, description, color }) => (
    <div className={`p-6 rounded-xl border ${color} flex flex-col gap-4`}>
        <div className="flex items-center gap-3">
            {icon}
            <h4 className="font-bold text-lg text-white">{title}</h4>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
);

const FeatureCard = ({ icon, title, text }) => (
    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-3 mb-3 text-white font-semibold">
            {icon}
            {title}
        </div>
        <p className="text-slate-400 text-sm">{text}</p>
    </div>
);

export default HelpView;
