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
  ReferenceDot,
  ReferenceLine,
  Label,
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

const chToLabel = (value) => {
  const labels = {
    0: 'Sin flujo',
    0.5: 'Goteo',
    1: 'flujo débil (preop)',
    1.5: 'flujo medio',
    2: 'flujo normal',
    3: 'flujo fuerte',
  };
  return labels[value] ?? value;
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

  const { chartData, chartDataChVol, maxDay, dayTicks, yMin, yMax, daysWithMp, retiradaSondaDay } = useMemo(() => {
    const dataPoints = records
      .filter((r) => {
        if (hasIngesta(r)) return false;
        const mp = r['or-mp'];
        const ch = Number(r['or-ch']) || 0;
        if (mp !== 'no' && mp != null && ch === 0) return false;
        return true;
      })
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
        if (pos === 'sentado') return false;
        const ch = Number(r['or-ch']) || 0;
        const mp = r['or-mp'];
        if (mp !== 'no' && mp != null && ch === 0) return false;
        return true;
      })
      .map((r) => ({
        dias: Math.round(daysSinceRef(r.fecha, r.hora) * 10) / 10,
        ch: Number(r['or-ch']) || 0,
        dol: Number(r['dol']) || 0,
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

    const scoreMin = dataPoints.length > 0 ? Math.min(...dataPoints.map((d) => d.score)) : -2;
    const scoreMax = dataPoints.length > 0 ? Math.max(...dataPoints.map((d) => d.score)) : 6;
    const yMin = Math.min(scoreMin - 1, -1);
    const yMax = Math.max(scoreMax + 1, 6);

    // Calcular media por día para score
    const scoreByDay = {};
    dataPoints.forEach((d) => {
      const day = Math.round(d.dias);
      if (!scoreByDay[day]) {
        scoreByDay[day] = { sum: 0, count: 0 };
      }
      scoreByDay[day].sum += d.score;
      scoreByDay[day].count += 1;
    });
    // Calcular media por día para score y agregar a cada punto
    const scoreAverageMap = {};
    Object.keys(scoreByDay).forEach((day) => {
      scoreAverageMap[day] = Math.round((scoreByDay[day].sum / scoreByDay[day].count) * 10) / 10;
    });
    const chartDataWithAvg = dataPoints.map((d) => ({
      ...d,
      scoreAvg: scoreAverageMap[Math.round(d.dias)] ?? null,
    }));

    // Calcular media por día para ch y agregar a cada punto
    const chByDay = {};
    dataPointsChVol.forEach((d) => {
      const day = Math.round(d.dias);
      if (!chByDay[day]) {
        chByDay[day] = { sum: 0, count: 0 };
      }
      chByDay[day].sum += d.ch;
      chByDay[day].count += 1;
    });
    const chAverageMap = {};
    Object.keys(chByDay).forEach((day) => {
      chAverageMap[day] = Math.round((chByDay[day].sum / chByDay[day].count) * 10) / 10;
    });
    const chartDataChVolWithAvg = dataPointsChVol.map((d) => ({
      ...d,
      chAvg: chAverageMap[Math.round(d.dias)] ?? null,
    }));

    // Calcular días con mp !== 'no' y mp !== 0 para mostrar cruces rojas
    const daysWithMp = new Set();
    records
      .filter((r) => {
        if (hasIngesta(r)) return false;
        const pos = r.pos || 'depie';
        if (pos === 'sentado') return false;
        const mp = r['or-mp'];
        return mp !== 'no' && mp != null && mp !== 0;
      })
      .forEach((r) => {
        const day = Math.round(daysSinceRef(r.fecha, r.hora));
        daysWithMp.add(day);
      });

    // Calcular día para retirada de sonda: 21.1.2026 07:00
    const retiradaSondaDay = daysSinceRef('2026-01-21', '07:00');

    return {
      chartData: chartDataWithAvg,
      chartDataChVol: chartDataChVolWithAvg,
      maxDay,
      dayTicks,
      yMin,
      yMax,
      daysWithMp: Array.from(daysWithMp),
      retiradaSondaDay,
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
                  <ReferenceArea y1={yMin} y2={0} fill="rgba(255, 69, 0, 0.2)" zIndex={0} />
                  <ReferenceArea y1={0} y2={4} fill="rgba(0, 128, 0, 0.2)" zIndex={0} />
                  <ReferenceArea y1={4} y2={yMax} fill="rgba(127, 255, 0, 0.2)" zIndex={0} />
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
                    domain={[yMin, yMax]}
                    label={{
                      value: 'Puntuación',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'Media') return [value, 'Media'];
                      return [value, 'Puntuación'];
                    }}
                    labelFormatter={(dias) => `Día ${dias}`}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      const isAverage = payload[0].dataKey === 'scoreAvg';
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <div>Día {p.dias}</div>
                          {isAverage ? (
                            <div>Media: {p.scoreAvg}</div>
                          ) : (
                            <>
                              <div>Puntuación: {p.score}</div>
                              <div className="text-slate-500">
                                {p.fecha} {p.hora}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const score = payload?.score ?? 0;
                      let fill = '#FF4500';
                      if (score > 0 && score <= 4) fill = '#008000';
                      else if (score > 4) fill = '#7FFF00';
                      return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#2563eb" strokeWidth={1} />;
                    }}
                    name="Puntuación"
                  />
                  <Line
                    type="monotone"
                    dataKey="scoreAvg"
                    stroke="#374151"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    dot={false}
                    name="Media"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          )}
          {chartDataChVol.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Flujo por días desde 21/01/2026
            </h2>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartDataChVol}
                  margin={{ top: 20, right: 30, bottom: 60, left: 20 }}
                >
                  <ReferenceArea y1={0} y2={0.5} fill="rgba(255, 69, 0, 0.2)" zIndex={0} />
                  <ReferenceArea y1={0.5} y2={1} fill="rgba(205, 92, 92, 0.2)" zIndex={0} />
                  <ReferenceArea y1={1} y2={1.5} fill="rgba(255, 215, 0, 0.2)" zIndex={0} />
                  <ReferenceArea y1={1.5} y2={2} fill="rgba(0, 128, 0, 0.2)" zIndex={0} />
                  <ReferenceArea y1={2} y2={3} fill="rgba(127, 255, 0, 0.2)" zIndex={0} />
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
                  {daysWithMp.map((day) => (
                    <ReferenceDot
                      key={`mp-${day}`}
                      x={day}
                      y={0}
                      r={6}
                      fill="#FF0000"
                      stroke="#FF0000"
                      strokeWidth={2}
                      shape={(props) => {
                        const { cx, cy } = props;
                        const size = 8;
                        return (
                          <g>
                            <line
                              x1={cx - size}
                              y1={cy - size}
                              x2={cx + size}
                              y2={cy + size}
                              stroke="#FF0000"
                              strokeWidth={2}
                            />
                            <line
                              x1={cx - size}
                              y1={cy + size}
                              x2={cx + size}
                              y2={cy - size}
                              stroke="#FF0000"
                              strokeWidth={2}
                            />
                          </g>
                        );
                      }}
                    />
                  ))}
                  <ReferenceLine
                    x={retiradaSondaDay}
                    stroke="#000000"
                    strokeWidth={2}
                    label={{
                      value: 'retirada de la sonda',
                      position: 'top',
                      fill: '#000000',
                      fontSize: 12,
                    }}
                  />
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
                    domain={[0, 3]}
                    ticks={[0, 0.5, 1, 1.5, 2, 3]}
                    tickFormatter={chToLabel}
                    label={{
                      value: 'Flujo',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      const dataKey = payload[0].dataKey;
                      const isAverage = dataKey === 'chAvg';
                      const isDol = dataKey === 'dol';
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <div>Día {p.dias}</div>
                          {isAverage ? (
                            <div>Media: {p.chAvg}</div>
                          ) : isDol ? (
                            <div>dol: {p.dol}</div>
                          ) : (
                            <>
                              <div>ch: {p.ch}</div>
                              <div className="text-slate-500">
                                {p.fecha} {p.hora}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ch"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const ch = payload?.ch ?? 0;
                      let fill = '#FF4500';
                      if (ch <= 0.25) fill = '#FF4500';
                      else if (ch <= 0.75) fill = '#CD5C5C';
                      else if (ch <= 1.25) fill = '#FFD700';
                      else if (ch <= 1.75) fill = '#008000';
                      else if (ch <= 2.5) fill = '#7FFF00';
                      else fill = '#00FFFF';
                      return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="#0ea5e9" strokeWidth={1} />;
                    }}
                    name="ch"
                  />
                  <Line
                    type="monotone"
                    dataKey="chAvg"
                    stroke="#374151"
                    strokeWidth={3}
                    strokeDasharray="2 2"
                    dot={false}
                    name="Media"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="dol"
                    stroke="#FF0000"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="dol"
                    connectNulls={false}
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
