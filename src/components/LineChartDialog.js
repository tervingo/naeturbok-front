import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LineChartDialog = ({ records, isOpen, onClose }) => {
  const chartData = useMemo(() => {
    if (!isOpen) return [];

    const startDate = new Date('2024-07-12');
    const dailyCounts = {};

    // Filter records from 12-7-2024 onwards
    const filteredRecords = records
      .filter(record => new Date(record.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Initialize daily counts for all dates
    filteredRecords.forEach(record => {
      const recordDate = record.date;
      if (!dailyCounts[recordDate]) {
        dailyCounts[recordDate] = {
          date: recordDate,
          lát: 0,
          lekar: 0,
          látIntensitySum: 0,
          lekarIntensitySum: 0,
          látAvgIntensity: 0,
          lekarAvgIntensity: 0
        };
      }

      // Count lát events and calculate average flaedi
      if (record.lát && record.lát.length > 0) {
        dailyCounts[recordDate].lát = record.lát.length;
        const totalFlaedi = record.lát.reduce((sum, lat) => sum + (lat.flaedi || 0), 0);
        dailyCounts[recordDate].látIntensitySum = totalFlaedi;
        dailyCounts[recordDate].látAvgIntensity = totalFlaedi / record.lát.length;
      }

      // Count lekar events and calculate average styrkur
      if (record.lekar && record.lekar.length > 0) {
        dailyCounts[recordDate].lekar = record.lekar.length;
        const totalStyrkur = record.lekar.reduce((sum, leak) => sum + (leak.styrkur !== undefined ? leak.styrkur : 1), 0);
        dailyCounts[recordDate].lekarIntensitySum = totalStyrkur;
        dailyCounts[recordDate].lekarAvgIntensity = totalStyrkur / record.lekar.length;
      }
    });

    // Convert to array and sort by date
    return Object.values(dailyCounts).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [records, isOpen]);

  if (!isOpen) return null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString('es-ES')}</p>
          {payload.map((entry, index) => {
            const data = chartData.find(d => d.date === label);
            const avgIntensity = entry.name === 'Lát' ? data?.látAvgIntensity : data?.lekarAvgIntensity;
            return (
              <div key={index}>
                <p className="text-sm" style={{ color: entry.color }}>
                  {entry.name}: {entry.value} eventos
                </p>
                {avgIntensity !== undefined && (
                  <p className="text-xs text-gray-600">
                    Intensidad promedio: {avgIntensity.toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Format date for X-axis
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  // Calculate max value for Y-axis
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.lát, d.lekar)),
    5 // minimum scale
  );

  // Custom dot renderer that varies size based on average intensity
  const renderCustomDot = (props, intensityKey, maxIntensity) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;

    const intensity = payload[intensityKey] || 0;
    // Map intensity to radius: 0->3, max->10
    const radius = 3 + (intensity / maxIntensity) * 7;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={props.fill}
        stroke={props.stroke}
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={24} />
            Evolución Diaria de Lát y Lekar
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {chartData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No hay datos disponibles desde el 12/07/2024
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-green-500"></div>
                  <span>Lát (tamaño del punto = intensidad promedio flaedi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-red-500"></div>
                  <span>Lekar (tamaño del punto = intensidad promedio styrkur)</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '500px' }}>
                <ResponsiveContainer>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      domain={[0, maxValue]}
                      label={{ value: 'Número de eventos', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Green line for lát with variable dot size based on average flaedi */}
                    <Line
                      type="monotone"
                      dataKey="lát"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={(props) => renderCustomDot(props, 'látAvgIntensity', 2)}
                      name="Lát"
                    />

                    {/* Red line for lekar with variable dot size based on average styrkur */}
                    <Line
                      type="monotone"
                      dataKey="lekar"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={(props) => renderCustomDot(props, 'lekarAvgIntensity', 3)}
                      name="Lekar"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-gray-500">
                <p>Datos desde 12/07/2024 • Muestra el número total de eventos por día</p>
                <p>Total de días con datos: {chartData.length}</p>
                <p>
                  Total lát: {chartData.reduce((sum, d) => sum + d.lát, 0)} •
                  Total lekar: {chartData.reduce((sum, d) => sum + d.lekar, 0)}
                </p>
                <p className="mt-1 font-medium">
                  El tamaño de cada punto en la línea representa la intensidad promedio del día
                </p>
                <p className="text-xs">
                  Lát: flaedi promedio (0=pequeño, 2=grande) • Lekar: styrkur promedio (0=muy pequeño, 3=grande)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LineChartDialog;