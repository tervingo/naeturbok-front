import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Thermometer, AlertCircle } from 'lucide-react';

const WeatherComparison = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  const fetchCurrentWeather = async () => {
    try {
      const response = await fetch(`${API_BASE}/weather/current`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentWeather(result.data);
        setLastUpdate(new Date(result.data.timestamp));
        setError(null);
      } else {
        setError(result.error || 'Error al obtener datos actuales');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching current weather:', err);
    }
  };

  const fetchWeatherHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/weather/history`);
      const result = await response.json();
      
      if (result.success) {
        setWeatherHistory(result.data);
      } else {
        console.error('Error fetching weather history:', result.error);
      }
    } catch (err) {
      console.error('Error fetching weather history:', err);
    }
  };

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/weather/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentWeather(result.data);
        setLastUpdate(new Date(result.data.timestamp));
        await fetchWeatherHistory();
        setError(null);
      } else {
        setError(result.error || 'Error al actualizar datos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error manual refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateNextUpdate = () => {
    if (lastUpdate) {
      const nextUpdateTime = new Date(lastUpdate.getTime() + 10 * 60 * 1000);
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextUpdateTime - now) / 1000));
      return diff;
    }
    return 0;
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCurrentWeather();
      await fetchWeatherHistory();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextUpdate(calculateNextUpdate());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchCurrentWeather();
      await fetchWeatherHistory();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !currentWeather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando datos meteorológicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Comparación Meteorológica Villafría
        </h1>
        <p className="text-gray-600">
          Datos de AEMET vs Google Weather • Lat: {42.36542}° Lon: {-3.61669}°
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Datos Actuales */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Thermometer className="text-blue-500" />
            Temperatura Actual
          </h2>
          <button
            onClick={manualRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            Actualizar
          </button>
        </div>

        {currentWeather && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">AEMET</h3>
              <div className="text-3xl font-bold text-red-600">
                {currentWeather.aemet?.temperature ? 
                  `${currentWeather.aemet.temperature}°C` : 
                  'No disponible'}
              </div>
              {currentWeather.aemet?.raw_data?.mock && (
                <p className="text-sm text-red-500 mt-1">Datos de prueba</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Google Weather</h3>
              <div className="text-3xl font-bold text-blue-600">
                {currentWeather.google_weather?.temperature ? 
                  `${currentWeather.google_weather.temperature}°C` : 
                  'No disponible'}
              </div>
              {currentWeather.google_weather?.raw_data?.mock && (
                <p className="text-sm text-blue-500 mt-1">Datos de prueba</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>
              Última actualización: {lastUpdate ? formatTime(lastUpdate.toISOString()) : 'Nunca'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={16} />
            <span>
              Próxima actualización en: {formatCountdown(nextUpdate)}
            </span>
          </div>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Historial (Últimas 30 actualizaciones)
        </h2>

        {weatherHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hora</th>
                  <th className="text-center py-3 px-4 font-semibold text-red-700">AEMET</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-700">Google Weather</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {weatherHistory.map((record, index) => {
                  const aemetTemp = record.aemet?.temperature;
                  const googleTemp = record.google_weather?.temperature;
                  const diff = (aemetTemp && googleTemp) ? 
                    (aemetTemp - googleTemp).toFixed(1) : null;
                  
                  return (
                    <tr key={record._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4">{formatDate(record.timestamp)}</td>
                      <td className="py-3 px-4">{formatTime(record.timestamp)}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-semibold">
                        {aemetTemp ? `${aemetTemp}°C` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-blue-600 font-semibold">
                        {googleTemp ? `${googleTemp}°C` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {diff ? (
                          <span className={diff > 0 ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-gray-500'}>
                            {diff > 0 ? '+' : ''}{diff}°C
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay datos históricos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default WeatherComparison;