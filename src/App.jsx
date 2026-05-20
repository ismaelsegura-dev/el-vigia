import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import LeafletMap from './components/LeafletMap';
import AlertsFeed from './components/AlertsFeed';
import WeatherCard from './components/WeatherCard';
import { Maximize2, Sun, Moon } from 'lucide-react';
import SensorTable from './components/SensorTable';
import ErrorBoundary from './components/ErrorBoundary';
import { api } from './services/api';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryView = lazy(() => import('./components/views/HistoryView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const LiveMapView = lazy(() => import('./components/views/LiveMapView'));
const SensorsView = lazy(() => import('./components/views/SensorsView'));
const HelpView = lazy(() => import('./components/views/HelpView'));

const ViewLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [kpiData, setKpiData] = useState({ activeSensors: 0, criticalAlerts: 0, avgBattery: 0 });
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [batteryThreshold, setBatteryThreshold] = useState(20);
  const [sensorFilter, setSensorFilter] = useState('all');
  const [focusedSensor, setFocusedSensor] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('vigia-theme') || 'dark');

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('vigia-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const fetchData = useCallback(async () => {
    try {
      const [sensorsRes, alertsRes, kpisRes] = await Promise.all([
        api.getSensors(),
        api.getAlerts(10),
        api.getKPIs(),
      ]);

      setSensors(sensorsRes.data);
      setAlerts(alertsRes.data.map(a => ({
        id: a.id,
        time: getTimeAgo(a.created_at),
        message: a.message,
        type: a.type,
        sensorId: a.sensor_id,
      })));
      setKpiData({
        activeSensors: parseInt(kpisRes.data.active_sensors),
        criticalAlerts: parseInt(kpisRes.data.critical_alerts),
        avgBattery: parseInt(kpisRes.data.avg_battery),
      });
      setApiError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleActiveClick = () => {
    setSensorFilter('all');
    setActiveView('sensors');
  };

  const handleCriticalClick = () => {
    const criticalSensors = sensors.filter(s => s.status === 'CRITICAL');
    if (criticalSensors.length === 1) {
      setFocusedSensor(criticalSensors[0]);
      setActiveView('map');
    } else {
      setSensorFilter('critical');
      setActiveView('sensors');
    }
  };

  const handleBatteryClick = () => {
    setSensorFilter('low_battery');
    setActiveView('sensors');
  };

  const handleAlertClick = (alert) => {
    if (!alert.sensorId) return;
    const sensorToFocus = sensors.find(s => s.id === alert.sensorId);
    if (sensorToFocus) {
      setFocusedSensor(sensorToFocus);
      setActiveView('map');
    }
  };

  const handleSensorClick = (sensor) => {
    setFocusedSensor(sensor);
    setActiveView('map');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={theme === 'light' ? 'text-slate-500 font-mono' : 'text-slate-400 font-mono'}>CONECTANDO CON EL SISTEMA...</p>
          </div>
        </div>
      );
    }

    if (apiError) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className={`text-center rounded-xl p-8 ${theme === 'light' ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border border-red-500/50'}`}>
            <p className="text-neon-red font-mono text-lg mb-2">ERROR DE CONEXION</p>
            <p className={theme === 'light' ? 'text-slate-500 text-sm' : 'text-slate-400 text-sm'}>{apiError}</p>
            <button
              onClick={fetchData}
              className={`mt-4 px-4 py-2 rounded border transition-colors ${theme === 'light' ? 'bg-white border-slate-300 hover:border-green-500' : 'bg-slate-800 border-slate-600 hover:border-neon-green'}`}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            key="dashboard"
            className="space-y-6"
          >
            <KPICards
              data={kpiData}
              onActiveClick={handleActiveClick}
              onCriticalClick={handleCriticalClick}
              onBatteryClick={handleBatteryClick}
              theme={theme}
            />

            <div className="grid grid-cols-12 gap-6 h-[500px]">
              <div className={`col-span-12 lg:col-span-8 rounded-xl border p-1 relative overflow-hidden group ${theme === 'light' ? 'bg-white/80 border-slate-300' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="h-full w-full rounded-lg overflow-hidden relative">
                  <LeafletMap sensors={sensors} theme={theme} />
                  <button
                    onClick={() => setActiveView('map')}
                    className={`absolute top-4 right-4 z-[400] p-2 rounded-lg border transition-all shadow-lg backdrop-blur-sm group/btn ${theme === 'light' ? 'bg-white/80 border-slate-300 text-slate-600 hover:bg-green-50 hover:border-green-500' : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-neon-green/20 hover:border-neon-green'}`}
                    title="Pantalla Completa"
                  >
                    <Maximize2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                <div className={`rounded-xl border p-4 flex flex-col h-1/2 overflow-hidden ${theme === 'light' ? 'bg-white/80 border-slate-300' : 'bg-slate-800/50 border-slate-700'}`}>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 sticky top-0 bg-transparent z-10 ${theme === 'light' ? 'text-slate-800' : ''}`}>
                    <span className="w-1 h-5 bg-neon-red shadow-[0_0_8px_#ff0000]"></span>
                    Alertas Recientes
                  </h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <AlertsFeed alerts={alerts} onAlertClick={handleAlertClick} theme={theme} />
                  </div>
                </div>
                <div className="h-1/2 overflow-hidden">
                  <WeatherCard theme={theme} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-6 ${theme === 'light' ? 'bg-white/80 border-slate-300' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-neon-green flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                  Estado de Sensores
                </h3>
                <button
                  onClick={() => { setSensorFilter('all'); setActiveView('sensors'); }}
                  className={`text-xs rounded px-3 py-1 border transition-colors ${theme === 'light' ? 'text-slate-500 border-slate-300 bg-white hover:text-slate-700' : 'text-slate-400 border-slate-600 bg-slate-800 hover:text-white'}`}
                >
                  Ver Todos
                </button>
              </div>
              <SensorTable sensors={sensors} onSensorClick={handleSensorClick} theme={theme} />
            </div>
          </motion.div>
        );
      case 'map':
        return <Suspense fallback={<ViewLoader />}><LiveMapView key="map" sensors={sensors} focusedSensor={focusedSensor} onBack={() => setActiveView('dashboard')} theme={theme} /></Suspense>;
      case 'sensors':
        return <Suspense fallback={<ViewLoader />}><SensorsView key="sensors" sensors={sensors} filter={sensorFilter} batteryThreshold={batteryThreshold} onBack={() => setActiveView('dashboard')} theme={theme} /></Suspense>;
      case 'history':
        return <Suspense fallback={<ViewLoader />}><HistoryView key="history" sensors={sensors} onBack={() => setActiveView('dashboard')} theme={theme} /></Suspense>;
      case 'settings':
        return <Suspense fallback={<ViewLoader />}><SettingsView key="settings" batteryThreshold={batteryThreshold} setBatteryThreshold={setBatteryThreshold} onBack={() => setActiveView('dashboard')} theme={theme} /></Suspense>;
      case 'help':
        return <Suspense fallback={<ViewLoader />}><HelpView key="help" onBack={() => setActiveView('dashboard')} theme={theme} /></Suspense>;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className={`flex min-h-screen font-sans selection:bg-neon-green selection:text-black ${theme === 'light' ? 'light-theme bg-slate-100 text-slate-900' : 'dark-theme bg-slate-900 text-white'}`}>
      <Sidebar activeView={activeView} onNavigate={(view) => {
        setActiveView(view);
        setFocusedSensor(null);
      }} theme={theme} />

      <main className="ml-64 flex-1 p-6 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Panel de Control General</h2>
            <p className={theme === 'light' ? 'text-slate-500 mt-1' : 'text-slate-400 mt-1'}>Monitorizacion en tiempo real del sistema de alcantarillado</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
              <span className={`text-sm font-mono ${theme === 'light' ? 'text-green-600' : 'text-neon-green'}`}>SYSTEM_READY</span>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-mono border ${theme === 'light' ? 'bg-white text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {new Date().toLocaleDateString('es-ES')}
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-colors ${theme === 'light' ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <ErrorBoundary>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${Math.floor(diffHours / 24)}d`;
}

export default App;
