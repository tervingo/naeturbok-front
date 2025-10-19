import React, { useMemo } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartDialog = ({ records, isOpen, onClose }) => {
  const chartData = useMemo(() => {
    if (!isOpen) return [];

    const startDate = new Date('2024-07-12');
    const data = [];

    // Filter records from 12-7-2024 onwards and sort by date
    const filteredRecords = records
      .filter(record => new Date(record.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));


    filteredRecords.forEach(record => {
      const recordDate = record.date;


      // Add green dots for lát
      if (record.lát && record.lát.length > 0) {
        record.lát.forEach(lat => {
          if (lat.tími) {
            const [hours, minutes] = lat.tími.split(':').map(Number);
            const timeInHours = hours + minutes / 60;

            // Only include times between 00:00 and 08:00
            if (timeInHours >= 0 && timeInHours <= 8) {
              data.push({
                date: recordDate,
                time: timeInHours,
                type: 'lát',
                color: '#22c55e', // green
                displayTime: lat.tími
              });
            }
          }
        });
      }

      // Add red dots for lekar
      if (record.lekar && record.lekar.length > 0) {
        record.lekar.forEach(leak => {
          if (leak.tími) {
            const [hours, minutes] = leak.tími.split(':').map(Number);
            const timeInHours = hours + minutes / 60;


            // Only include times between 00:00 and 08:00
            if (timeInHours >= 0 && timeInHours <= 8) {
              data.push({
                date: recordDate,
                time: timeInHours,
                type: 'leki',
                color: '#ef4444', // red
                displayTime: leak.tími,
                styrkur: leak.styrkur
              });
            }
          }
        });
      }
    });


    return data;
  }, [records, isOpen]);

  if (!isOpen) return null;


  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{data.date}</p>
          <p className="text-sm">Hora: {data.displayTime}</p>
          <p className="text-sm capitalize">Tipo: {data.type}</p>
          {data.styrkur && <p className="text-sm">Styrkur: {data.styrkur}</p>}
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

  // Format time for Y-axis
  const formatTime = (timeInHours) => {
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get unique dates for X-axis
  const uniqueDates = [...new Set(chartData.map(d => d.date))].sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} />
            Gráfica de Lát y Lekar (00:00 - 08:00)
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
                No hay datos de lát o lekar entre las 00:00 y 08:00 desde el 12/07/2024
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Lát</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Lekar</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '500px' }}>
                <ResponsiveContainer>
                  <ScatterChart
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="category"
                      dataKey="date"
                      domain={uniqueDates}
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      type="number"
                      dataKey="time"
                      domain={[0, 8]}
                      tickFormatter={formatTime}
                      label={{ value: 'Hora', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* All data points with custom shape for color */}
                    <Scatter
                      data={chartData}
                      shape={({ cx, cy, payload }) => {
                        const color = payload.type === 'lát' ? '#22c55e' : '#ef4444';
                        return <circle cx={cx} cy={cy} r={4} fill={color} stroke={color} strokeWidth={1} />;
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs text-gray-500">
                <p>Datos desde 12/07/2024 • Solo se muestran eventos entre 00:00 y 08:00</p>
                <p>Total de puntos: {chartData.length} ({chartData.filter(d => d.type === 'lát').length} lát, {chartData.filter(d => d.type === 'leki').length} lekar)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartDialog;