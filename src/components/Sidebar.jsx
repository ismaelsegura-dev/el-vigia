
import React from 'react';
import { LayoutDashboard, Map, History, Settings, Wifi, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeView, onNavigate }) => {
    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50"
        >
            {/* Header / Logo */}
            <div className="p-6 border-b border-slate-800/50">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-green to-blue-400">
                    VIGÍA SYSTEM <span className="text-xs text-slate-500 font-normal block">v1.0</span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={activeView === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                    delay={0.1}
                />
                <NavItem
                    icon={<Map size={20} />}
                    label="Mapa en Vivo"
                    active={activeView === 'map'}
                    onClick={() => onNavigate('map')}
                    delay={0.2}
                />
                <NavItem
                    icon={<History size={20} />}
                    label="Histórico"
                    active={activeView === 'history'}
                    onClick={() => onNavigate('history')}
                    delay={0.3}
                />
                <NavItem
                    icon={<Settings size={20} />}
                    label="Configuración"
                    active={activeView === 'settings'}
                    onClick={() => onNavigate('settings')}
                    delay={0.4}
                />
                <div className="border-t border-slate-800/50 my-2 pt-2">
                    <NavItem
                        icon={<HelpCircle size={20} />}
                        label="Ayuda / Guía"
                        active={activeView === 'help'}
                        onClick={() => onNavigate('help')}
                        delay={0.5}
                    />
                </div>
            </nav>

            {/* Footer Status */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
                <div className="flex items-center gap-3 text-neon-green text-sm font-medium p-2 bg-slate-800/50 rounded-lg border border-neon-green/20 shadow-[0_0_10px_-3px_rgba(0,255,0,0.2)]">
                    <div className="relative">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-ping absolute inset-0 opacity-75"></div>
                        <div className="w-2 h-2 bg-neon-green rounded-full relative"></div>
                    </div>
                    <span>Servidor Conectado</span>
                    <Wifi size={14} className="ml-auto opacity-70" />
                </div>
                <p className="text-xs text-slate-600 mt-2 text-center">Ayuntamiento de Sevilla</p>
            </div>
        </motion.div>
    );
};

const NavItem = ({ icon, label, active = false, onClick, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + delay }}
            onClick={onClick}
            className={`
      flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group
      ${active
                    ? 'bg-gradient-to-r from-neon-green/10 to-transparent text-neon-green border-l-4 border-neon-green'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
    `}>
            <span className={`${active ? 'text-neon-green' : 'group-hover:text-white'}`}>{icon}</span>
            <span className="font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#00ff00]"></div>}
        </motion.div>
    );
};

export default Sidebar;
