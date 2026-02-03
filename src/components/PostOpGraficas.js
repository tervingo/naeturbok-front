import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  const chartData = records
    .filter((r) => !hasIngesta(r))
    .map((r) => ({
      dias: Math.round(daysSinceRef(r.fecha, r.hora) * 10) / 10,
      score: calcPuntuacion(r),
      fecha: r.fecha,
      hora: r.hora || '',
    }))
    .sort((a, b) => a.dias - b.dias);

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
        ) : chartData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            No hay datos para mostrar (registros con ingesta excluidos).
          </div>
        ) : (
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dias"
                    type="number"
                    domain={['dataMin', 'dataMax']}
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
      </main>
    </div>
  );
};

export default PostOpGraficas;
