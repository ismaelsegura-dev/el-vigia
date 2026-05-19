
export const KPIS = {
    activeSensors: 142,
    criticalAlerts: 1,
    avgBattery: 84,
};

export const ALERTS = [
    { id: 1, time: "2 min ago", message: "Nivel crítico en Sensor #04", type: "critical", sensorId: "04" },
    { id: 2, time: "15 min ago", message: "Batería baja en Sensor #12", type: "warning", sensorId: "12" },
    { id: 3, time: "1 hour ago", message: "Sensor #08 restaurado", type: "success", sensorId: "08" },
    { id: 4, time: "2 hours ago", message: "Mantenimiento completado en #01", type: "info", sensorId: "01" },
    { id: 5, time: "3 hours ago", message: "Conexión perdida en #04", type: "warning", sensorId: "04" },
];

export const SENSORS_INITIAL = [
    { id: "01", location: "Plaza España", level: 45, battery: 92, status: "OK", lat: 37.3891, lng: -5.9845 },
    { id: "02", location: "Av. Constitución", level: 32, battery: 88, status: "OK", lat: 37.3850, lng: -5.9900 },
    { id: "03", location: "C/ San Fernando", level: 28, battery: 95, status: "OK", lat: 37.3820, lng: -5.9930 },
    { id: "04", location: "C/ Mairena", level: 95, battery: 12, status: "CRITICAL", lat: 37.3870, lng: -5.9810 },
    { id: "05", location: "Alameda", level: 60, battery: 78, status: "WARNING", lat: 37.4000, lng: -5.9950 },
    { id: "06", location: "Triana", level: 15, battery: 99, status: "OK", lat: 37.3840, lng: -6.0020 },
    { id: "08", location: "Macarena", level: 42, battery: 65, status: "OK", lat: 37.4030, lng: -5.9890 },
    { id: "12", location: "Nervión", level: 78, battery: 15, status: "WARNING", lat: 37.3800, lng: -5.9750 },
];

// Helper to simulate data fluctuation
export const getFluctuatedLevel = (currentLevel) => {
    // Fluctuate between -2 and +3, keeping within 0-100
    const change = Math.floor(Math.random() * 6) - 2;
    let newLevel = currentLevel + change;
    if (newLevel > 100) newLevel = 100;
    if (newLevel < 0) newLevel = 0;
    return newLevel;
};
