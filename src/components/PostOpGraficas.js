import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import ApiService from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { calcPuntuacion, hasIngesta } from '../utils/postop';

const REF_DATE = new Date('2026-01-21T00:00:00');

const daysSinceRef = (fecha, hora) => {
  const h = hora || '12:00';
  const d = new Date(`${fecha}T${h.length === 5 ? h + ':00' : h}`);
  return (d - REF_DATE) / (1000 * 60 * 60 * 24);
};

const diasToFecha = (dias) => {
  const d = new Date(REF_DATE);
  d.setDate(d.getDate() + Math.round(dias));
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const PostOpGraficas = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getPostopList();
        if (res.success) setRecords(res.data || []);
      } catch (err) {
        console.error(err);
        alert('Error al cargar los registros: ' + err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const { chartData, chartDataChVol, maxDay, dayTicks } = useMemo(() => {
    const dataPoints = records
      .filter((r) => !hasIngesta(r))
      .map((r) => ({
        dias: Math.round(daysSinceRef(r.fecha, r.hora) * 10) / 10,
        score: calcPuntuacion(r),
        fecha: r.fecha,
        hora: r.hora || '',
      }))
      .sort((a, b) => a.dias - b.dias);

    const dataPointsChVol = records
      .filter((r) => {
        if (hasIngesta(r)) return false;
        const pos = r.pos || 'depie';
        const ch = Number(r['or-ch']) || 0;
        const vol = Number(r['or-vol']) || 0;
        const mp = r['or-mp'];
        if (mp !== 'no' && mp != null && ch === 0) return false;
        return !(pos === 'sentado' && ch === 0 && vol === 0);
      })
      .map((r) => ({
        dias: Math.round(daysSinceRef(r.fecha, r.hora) * 10) / 10,
        ch: Number(r['or-ch']) || 0,
        fecha: r.fecha,
        hora: r.hora || '',
      }))
      .sort((a, b) => a.dias - b.dias);

    const maxDayFromData = dataPoints.length > 0 ? Math.ceil(Math.max(...dataPoints.map((d) => d.dias))) : 0;
    const maxDayFromChVol = dataPointsChVol.length > 0 ? Math.ceil(Math.max(...dataPointsChVol.map((d) => d.dias))) : 0;
    const maxDayFromAll = records.reduce((acc, r) => {
      const d = daysSinceRef(r.fecha, r.hora);
      return d > acc ? d : acc;
    }, 0);
    const maxDay = Math.max(maxDayFromData, maxDayFromChVol, Math.ceil(maxDayFromAll), 0);

    const dayTicks = [];
    for (let i = 0; i <= maxDay; i++) dayTicks.push(i);

    return {
      chartData: dataPoints,
      chartDataChVol: dataPointsChVol,
      maxDay,
      dayTicks,
    };
  }, [records]);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link
              to="/postop"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Volver a PostOp
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gráficas PostOp</h1>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-blue-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            No hay registros para mostrar.
          </div>
        ) : (
          <div className="space-y-8">
          {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Puntuación por días desde 21/01/2026
            </h2>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
                >
                  {dayTicks.map((d) => (
                    <ReferenceArea
                      key={d}
                      x1={d}
                      x2={d + 1}
                      fill={d % 2 === 0 ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.06)'}
                      fillOpacity={1}
                      zIndex={0}
                    />
                  ))}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dias"
                    type="number"
                    domain={[0, maxDay]}
                    ticks={dayTicks}
                    tick={{ angle: -45, textAnchor: 'end' }}
                    tickFormatter={diasToFecha}
                    label={{
                      value: 'Días desde 21/01/2026',
                      position: 'insideBottom',
                      offset: -10,
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Puntuación',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'Puntuación']}
                    labelFormatter={(dias) => `Día ${dias}`}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <div>Día {p.dias}</div>
                          <div>Puntuación: {p.score}</div>
                          <div className="text-slate-500">
                            {p.fecha} {p.hora}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Puntuación"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
          {chartDataChVol.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ch por días desde 21/01/2026
            </h2>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartDataChVol}
                  margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
                >
                  {dayTicks.map((d) => (
                    <ReferenceArea
                      key={d}
                      x1={d}
                      x2={d + 1}
                      fill={d % 2 === 0 ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.06)'}
                      fillOpacity={1}
                      zIndex={0}
                    />
                  ))}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dias"
                    type="number"
                    domain={[0, maxDay]}
                    ticks={dayTicks}
                    tick={{ angle: -45, textAnchor: 'end' }}
                    tickFormatter={diasToFecha}
                    label={{
                      value: 'Días desde 21/01/2026',
                      position: 'insideBottom',
                      offset: -10,
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'ch',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <div>Día {p.dias}</div>
                          <div>ch: {p.ch}</div>
                          <div className="text-slate-500">
                            {p.fecha} {p.hora}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ch"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="ch"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PostOpGraficas;
