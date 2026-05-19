
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import LeafletMap from './components/LeafletMap';
import AlertsFeed from './components/AlertsFeed';
import { Maximize2 } from 'lucide-react';
import SensorTable from './components/SensorTable';
// Views
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import LiveMapView from './components/views/LiveMapView';
import SensorsView from './components/views/SensorsView';
import HelpView from './components/views/HelpView';

import { KPIS, ALERTS, SENSORS_INITIAL, getFluctuatedLevel } from './data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [kpiData, setKpiData] = useState(KPIS);
  const [alerts, setAlerts] = useState(ALERTS);
  const [sensors, setSensors] = useState(SENSORS_INITIAL);

  // States lifted from views
  const [batteryThreshold, setBatteryThreshold] = useState(20);
  const [sensorFilter, setSensorFilter] = useState('all');
  const [focusedSensor, setFocusedSensor] = useState(null);

  // Simulate Real-Time Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors => prevSensors.map(sensor => ({
        ...sensor,
        level: getFluctuatedLevel(sensor.level)
      })));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update KPI Data based on dynamic sensors
  useEffect(() => {
    const active = sensors.filter(s => s.status === 'OK' || s.status === 'WARNING').length;
    const critical = sensors.filter(s => s.status === 'CRITICAL').length;
    const avgBatt = Math.round(sensors.reduce((acc, s) => acc + s.battery, 0) / sensors.length);

    setKpiData({
      activeSensors: active,
      criticalAlerts: critical,
      avgBattery: avgBatt
    });
  }, [sensors]);

  // KPI Click Handlers
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
    switch (activeView) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            key="dashboard"
            className="space-y-6"
          >
            {/* KPI Section */}
            <KPICards
              data={kpiData}
              onActiveClick={handleActiveClick}
              onCriticalClick={handleCriticalClick}
              onBatteryClick={handleBatteryClick}
            />

            {/* Map & Widgets Section */}
            <div className="grid grid-cols-12 gap-6 h-[500px]">
              {/* Main Map - Spans 8 cols */}
              <div className="col-span-12 lg:col-span-8 bg-slate-800/50 rounded-xl border border-slate-700 p-1 relative overflow-hidden group">
                {/* Map Component */}
                <div className="h-full w-full rounded-lg overflow-hidden relative">
                  <LeafletMap sensors={sensors} />

                  {/* Maximize Button Overlay */}
                  <button
                    onClick={() => setActiveView('map')}
                    className="absolute top-4 right-4 z-[400] bg-slate-900/80 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-neon-green/20 hover:border-neon-green border border-slate-700 transition-all shadow-lg backdrop-blur-sm group/btn"
                    title="Pantalla Completa"
                  >
                    <Maximize2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Alerts Feed - Spans 4 cols */}
              <div className="col-span-12 lg:col-span-4 bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex flex-col h-full overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 sticky top-0 bg-transparent z-10">
                  <span className="w-1 h-5 bg-neon-red shadow-[0_0_8px_#ff0000]"></span>
                  Alertas Recientes
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <AlertsFeed alerts={alerts} onAlertClick={handleAlertClick} />
                </div>
              </div>
            </div>

            {/* Sensor Table Section */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-neon-green flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                  Estado de Sensores
                </h3>
                <button
                  onClick={() => { setSensorFilter('all'); setActiveView('sensors'); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors border border-slate-600 rounded px-3 py-1 bg-slate-800"
                >
                  Ver Todos
                </button>
              </div>
              <SensorTable sensors={sensors} onSensorClick={handleSensorClick} />
            </div>
          </motion.div>
        );
      case 'map':
        return <LiveMapView key="map" sensors={sensors} focusedSensor={focusedSensor} onBack={() => setActiveView('dashboard')} />;
      case 'sensors':
        return <SensorsView key="sensors" sensors={sensors} filter={sensorFilter} batteryThreshold={batteryThreshold} onBack={() => setActiveView('dashboard')} />;
      case 'history':
        return <HistoryView key="history" onBack={() => setActiveView('dashboard')} />;


      case 'settings':
        return <SettingsView key="settings" batteryThreshold={batteryThreshold} setBatteryThreshold={setBatteryThreshold} onBack={() => setActiveView('dashboard')} />;
      case 'help':
        return <HelpView key="help" onBack={() => setActiveView('dashboard')} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans selection:bg-neon-green selection:text-black">
      <Sidebar activeView={activeView} onNavigate={(view) => {
        setActiveView(view);
        setFocusedSensor(null); // Reset focus when manually navigating
      }} />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-6 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Panel de Control General</h2>
            <p className="text-slate-400 mt-1">Monitorización en tiempo real del sistema de alcantarillado</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-800 rounded-lg flex items-center gap-2 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
              <span className="text-sm font-mono text-neon-green">SYSTEM_READY</span>
            </div>
            <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-mono text-slate-300 border border-slate-700">
              {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default App;
