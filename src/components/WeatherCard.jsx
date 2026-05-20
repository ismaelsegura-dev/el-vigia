import React, { useState, useEffect } from 'react';
import { CloudRain, Droplets, Thermometer, Wind, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const WeatherCard = () => {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = async () => {
    try {
      const res = await api.getWeather();
      setForecast(res.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.refreshWeather();
      await fetchWeather();
    } catch (err) {
      console.error('Error refreshing weather:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getWeatherIcon = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('tormenta') || d.includes('lluvia')) return '🌧️';
    if (d.includes('nublado')) return '☁️';
    if (d.includes('despejado')) return '☀️';
    return '⛅';
  };

  const getPrecipColor = (prob) => {
    if (prob >= 70) return 'text-neon-red';
    if (prob >= 40) return 'text-neon-yellow';
    return 'text-neon-green';
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <CloudRain size={16} className="text-blue-400" />
          Meteorologia AEMET - Sevilla
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw size={14} className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {forecast.slice(0, 5).map((day, i) => {
          const date = new Date(day.forecast_date + 'T00:00:00');
          const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Manana' : date.toLocaleDateString('es-ES', { weekday: 'short' });

          return (
            <div key={day.forecast_date} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/50 last:border-0">
              <span className="text-slate-300 font-medium w-16">{dayName}</span>
              <span className="text-base w-8 text-center">{getWeatherIcon(day.description)}</span>
              <div className="flex items-center gap-3 flex-1 justify-center">
                <span className="flex items-center gap-1 text-slate-400">
                  <Thermometer size={12} />
                  {Math.round(day.temperature_min)}°/{Math.round(day.temperature_max)}°
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Droplets size={12} />
                  {day.precipitation_mm}mm
                </span>
              </div>
              <span className={`font-bold w-12 text-right ${getPrecipColor(day.precipitation_prob)}`}>
                {day.precipitation_prob}%
              </span>
            </div>
          );
        })}
      </div>

      {forecast.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Prob. lluvia hoy:</span>
            <span className={`font-bold ${getPrecipColor(forecast[0].precipitation_prob)}`}>
              {forecast[0].precipitation_prob}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400">Precipitacion acumulada:</span>
            <span className="text-slate-300 font-medium">{forecast[0].precipitation_mm} mm</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
