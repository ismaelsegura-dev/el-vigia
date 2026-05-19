
import React from 'react';
import LeafletMap from '../LeafletMap';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const LiveMapView = ({ sensors, focusedSensor, onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[calc(100vh-8rem)] w-full rounded-xl overflow-hidden border border-slate-700 relative shadow-2xl"
        >
            <LeafletMap sensors={sensors} focusedSensor={focusedSensor} />

            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={onBack}
                    className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-semibold">Volver</span>
                </button>
                <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700 backdrop-blur-md">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span>
                        Monitorización en Vivo
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Actualización cada 5s</p>
                </div>
            </div>
        </motion.div>
    );
};

export default LiveMapView;
