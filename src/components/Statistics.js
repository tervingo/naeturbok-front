import React from 'react';
import { BarChart3, Target, Calendar, Clock, TrendingUp, Coffee, Activity } from 'lucide-react';

const Statistics = ({ records }) => {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('is-IS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const totalRecords = records.length;
  const totalLekar = records.reduce((sum, record) => sum + (record['fjöldi leka'] || 0), 0);
  const totalLát = records.reduce((sum, record) => sum + (record.lát?.length || 0), 0);
  const averageLekarPerDay = totalRecords > 0 ? Math.round((totalLekar / totalRecords) * 10) / 10 : 0;
  const lastRecordDate = totalRecords > 0 ? records[0].date : null;

  // Calculate weekly averages (last 7 days)
  const last7Days = records.slice(0, 7);
  const weeklyAverage = last7Days.length > 0 
    ? Math.round((last7Days.reduce((sum, record) => sum + (record['fjöldi leka'] || 0), 0) / last7Days.length) * 10) / 10
    : 0;

  // Calculate intensity statistics
  const allLeaks = records.flatMap(record => record.lekar || []);
  const averageIntensity = allLeaks.length > 0 
    ? Math.round((allLeaks.reduce((sum, leak) => sum + leak.styrkur, 0) / allLeaks.length) * 10) / 10
    : 0;

  // Calculate lifestyle factors
  const totalCoffee = records.reduce((sum, record) => sum + (record.upplýsingar?.kaffi || 0), 0);
  const averageCoffee = totalRecords > 0 ? Math.round((totalCoffee / totalRecords) * 10) / 10 : 0;
  
  const exerciseDays = records.filter(record => record.upplýsingar?.æfing > 0).length;
  const exercisePercentage = totalRecords > 0 ? Math.round((exerciseDays / totalRecords) * 100) : 0;

  const alcoholDays = records.filter(record => {
    const alcohol = record.upplýsingar?.áfengi || {};
    return (alcohol.bjór > 0) || (alcohol.vín > 0) || (alcohol.annar > 0);
  }).length;
  const alcoholPercentage = totalRecords > 0 ? Math.round((alcoholDays / totalRecords) * 100) : 0;

  // Recent trends (last 7 vs previous 7 days)
  const recentTrend = (() => {
    if (records.length < 7) return 'stable';
    
    const recent7 = records.slice(0, 7);
    const previous7 = records.slice(7, 14);
    
    if (previous7.length === 0) return 'stable';
    
    const recentAvg = recent7.reduce((sum, r) => sum + (r['fjöldi leka'] || 0), 0) / recent7.length;
    const previousAvg = previous7.reduce((sum, r) => sum + (r['fjöldi leka'] || 0), 0) / previous7.length;
    
    if (recentAvg > previousAvg * 1.1) return 'increasing';
    if (recentAvg < previousAvg * 0.9) return 'decreasing';
    return 'stable';
  })();

  const getTrendIcon = () => {
    switch (recentTrend) {
      case 'increasing':
        return <TrendingUp className="text-red-600" size={20} />;
      case 'decreasing':
        return <TrendingUp className="text-green-600 transform rotate-180" size={20} />;
      default:
        return <Activity className="text-gray-600" size={20} />;
    }
  };

  const getTrendText = () => {
    switch (recentTrend) {
      case 'increasing':
        return { text: 'Aumentando', color: 'text-red-600' };
      case 'decreasing':
        return { text: 'Disminuyendo', color: 'text-green-600' };
      default:
        return { text: 'Estable', color: 'text-gray-600' };
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Estadísticas</h2>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendText().color}`}>
            Tendencia: {getTrendText().text}
          </span>
        </div>
      </div>
      
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Target size={24} />}
          title="Total registros"
          value={totalRecords}
          color="blue"
        />

        <StatCard
          icon={<BarChart3 size={24} />}
          title="Lekar totales"
          value={totalLekar}
          color="red"
        />

        <StatCard
          icon={<Calendar size={24} />}
          title="Promedio/día"
          value={averageLekarPerDay}
          subtitle={`Última semana: ${weeklyAverage}`}
          color="green"
        />

        <StatCard
          icon={<Clock size={24} />}
          title="Último registro"
          value={lastRecordDate ? formatDate(lastRecordDate) : 'N/A'}
          color="yellow"
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Activity size={24} />}
          title="Intensidad promedio"
          value={averageIntensity}
          subtitle="Escala 1-3"
          color="purple"
        />

        <StatCard
          icon={<Coffee size={24} />}
          title="Café promedio/día"
          value={averageCoffee}
          subtitle={`Total: ${totalCoffee} tazas`}
          color="yellow"
        />

        <StatCard
          icon={<Target size={24} />}
          title="Días con ejercicio"
          value={`${exercisePercentage}%`}
          subtitle={`${exerciseDays} de ${totalRecords} días`}
          color="green"
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Factores de estilo de vida</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Días con alcohol</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: `${alcoholPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-800">{alcoholPercentage}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Días con ejercicio</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${exercisePercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-800">{exercisePercentage}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total eventos Lát</span>
              <span className="text-sm text-gray-800">{totalLát}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por intensidad</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(intensity => {
              const count = allLeaks.filter(leak => leak.styrkur === intensity).length;
              const percentage = allLeaks.length > 0 ? Math.round((count / allLeaks.length) * 100) : 0;
              const labels = { 1: 'Létt', 2: 'Miðlungs', 3: 'Sterkt' };
              const colors = { 1: 'bg-green-600', 2: 'bg-yellow-600', 3: 'bg-red-600' };
              
              return (
                <div key={intensity} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">{labels[intensity]}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colors[intensity]} h-2 rounded-full`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-800 w-12">{count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Records Summary */}
      {records.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos 7 días</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Fecha</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Lekar</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Lát</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Kaffi</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-gray-600">Æfing</th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 7).map((record, index) => (
                  <tr key={record._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-2 px-3 text-sm text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        (record['fjöldi leka'] || 0) === 0 ? 'bg-green-100 text-green-800' :
                        (record['fjöldi leka'] || 0) <= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {record['fjöldi leka'] || 0}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 text-center">
                      {record.lát?.length || 0}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 text-center">
                      {record.upplýsingar?.kaffi || 0}
                    </td>
                    <td className="py-2 px-3 text-sm text-center">
                      {record.upplýsingar?.æfing > 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Future Features */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximamente</h3>
        <div className="text-gray-600 space-y-2">
          <p>• Gráficos de tendencias por semana/mes</p>
          <p>• Correlaciones entre factores y eventos</p>
          <p>• Análisis de patrones horarios</p>
          <p>• Predicciones basadas en datos históricos</p>
          <p>• Exportación de datos a Excel/CSV</p>
          <p>• Recordatorios y alertas personalizables</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;