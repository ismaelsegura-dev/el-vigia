import React from 'react';
import LeafletMap from '../LeafletMap';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const LiveMapView = ({ sensors, focusedSensor, onBack, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`h-[calc(100vh-8rem)] w-full rounded-xl overflow-hidden border relative shadow-2xl ${isLight ? 'border-slate-300' : 'border-slate-700'}`}
        >
            <LeafletMap sensors={sensors} focusedSensor={focusedSensor} theme={theme} />

            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={onBack}
                    className={`p-2 rounded-lg border backdrop-blur-md flex items-center gap-2 transition-colors ${isLight ? 'bg-white/90 border-slate-300 text-slate-600 hover:bg-white' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'}`}
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-semibold">Volver</span>
                </button>
                <div className={`p-4 rounded-lg border backdrop-blur-md ${isLight ? 'bg-white/90 border-slate-300' : 'bg-slate-900/90 border-slate-700'}`}>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span>
                        Monitorizacion en Vivo
                    </h2>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Actualizacion cada 10s</p>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveMapView;
