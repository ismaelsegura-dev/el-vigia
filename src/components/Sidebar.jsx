import React from 'react';
import { LayoutDashboard, Map, History, Settings, Wifi, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeView, onNavigate, theme = 'dark' }) => {
    const isLight = theme === 'light';

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`h-screen w-64 border-r flex flex-col fixed left-0 top-0 z-50 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}
        >
            <div className={`p-6 border-b ${isLight ? 'border-slate-200/50' : 'border-slate-800/50'}`}>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-green to-blue-400">
                    VIGIA SYSTEM <span className={`text-xs block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>v1.0</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={activeView === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                    delay={0.1}
                    theme={theme}
                />
                <NavItem
                    icon={<Map size={20} />}
                    label="Mapa en Vivo"
                    active={activeView === 'map'}
                    onClick={() => onNavigate('map')}
                    delay={0.2}
                    theme={theme}
                />
                <NavItem
                    icon={<History size={20} />}
                    label="Historico"
                    active={activeView === 'history'}
                    onClick={() => onNavigate('history')}
                    delay={0.3}
                    theme={theme}
                />
                <NavItem
                    icon={<Settings size={20} />}
                    label="Configuracion"
                    active={activeView === 'settings'}
                    onClick={() => onNavigate('settings')}
                    delay={0.4}
                    theme={theme}
                />
                <div className={`border-t my-2 pt-2 ${isLight ? 'border-slate-200/50' : 'border-slate-800/50'}`}>
                    <NavItem
                        icon={<HelpCircle size={20} />}
                        label="Ayuda / Guia"
                        active={activeView === 'help'}
                        onClick={() => onNavigate('help')}
                        delay={0.5}
                        theme={theme}
                    />
                </div>
            </nav>

            <div className={`p-4 border-t ${isLight ? 'border-slate-200/50 bg-slate-50/50' : 'border-slate-800/50 bg-slate-900/50'}`}>
                <div className={`flex items-center gap-3 text-neon-green text-sm font-medium p-2 rounded-lg border shadow-[0_0_10px_-3px_rgba(0,255,0,0.2)] ${isLight ? 'bg-green-50 border-green-200' : 'bg-slate-800/50 border-neon-green/20'}`}>
                    <div className="relative">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-ping absolute inset-0 opacity-75"></div>
                        <div className="w-2 h-2 bg-neon-green rounded-full relative"></div>
                    </div>
                    <span>Servidor Conectado</span>
                    <Wifi size={14} className="ml-auto opacity-70" />
                </div>
                <p className={`text-xs mt-2 text-center ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>Ayuntamiento de Sevilla</p>
            </div>
        </motion.div>
    );
};

const NavItem = ({ icon, label, active = false, onClick, delay, theme = 'dark' }) => {
    const isLight = theme === 'light';

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
                    : isLight
                        ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
    `}>
            <span className={active ? 'text-neon-green' : isLight ? 'group-hover:text-slate-800' : 'group-hover:text-white'}>{icon}</span>
            <span className="font-medium">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_#00ff00]"></div>}
        </motion.div>
    );
};

export default Sidebar;
