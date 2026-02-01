import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostOpForm, { initialPostOp } from './PostOpForm';
import ApiService from '../services/api';
import { ArrowLeft, Plus } from 'lucide-react';

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  try {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

const escalasZonas = [
  {
    label: 'gan + ur',
    bg: 'bg-amber-50 border-amber-200/60',
    fields: [
      { key: 'or-gan', label: 'gan' },
      { key: 'or-ur', label: 'ur' },
    ],
  },
  {
    label: 'ch + vol',
    bg: 'bg-sky-50 border-sky-200/60',
    fields: [
      { key: 'or-ch', label: 'ch' },
      { key: 'or-vol', label: 'vol' },
    ],
  },
  {
    label: 'mlk + spv',
    bg: 'bg-emerald-50 border-emerald-200/60',
    fields: [
      { key: 'or-mlk', label: 'mlk' },
      { key: 'or-spv', label: 'spv' },
    ],
  },
  {
    label: 'mp',
    bg: 'bg-violet-50 border-violet-200/60',
    fields: [{ key: 'or-mp', label: 'mp' }],
  },
  {
    label: 'hec',
    bg: 'bg-slate-100 border-slate-200/80',
    fields: [{ key: 'hec', label: 'hec' }],
  },
];

const PostOpPage = () => {
  const [records, setRecords] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formData, setFormData] = useState(initialPostOp());
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const fetchRecords = async () => {
    setListLoading(true);
    try {
      const res = await ApiService.getPostopList();
      if (res.success) setRecords(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Error al cargar los registros: ' + err.message);
    }
    setListLoading(false);
  };

  useEffect(() => {
    if (viewMode === 'list') fetchRecords();
  }, [viewMode]);

  const handleSave = async () => {
    setSaveLoading(true);
    setSavedMessage(false);
    try {
      const res = await ApiService.createPostop(formData);
      if (res.success) {
        setSavedMessage(true);
        setFormData(initialPostOp());
        setViewMode('list');
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    }
    setSaveLoading(false);
  };

  const handleCancel = () => {
    setFormData(initialPostOp());
    setViewMode('list');
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Volver
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">PostOp</h1>
            </div>
            {viewMode === 'list' && (
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Nuevo registro
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-slate-50/60">
        <div className="max-w-3xl mx-auto">
          {savedMessage && viewMode === 'list' && (
            <div className="mb-6 py-3 px-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium border border-emerald-200/80">
              Registro guardado correctamente.
            </div>
          )}

          {viewMode === 'list' && (
            <>
              {listLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-blue-500" />
                </div>
              ) : records.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-12 text-center">
                  <p className="text-slate-500 font-medium">No hay registros</p>
                  <p className="text-slate-400 text-sm mt-1">Pulsa «Nuevo registro» para añadir uno.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {records.map((r) => (
                    <li
                      key={r._id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md hover:border-slate-300/80 transition-all duration-200"
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                          <div className="flex items-baseline gap-2">
                            <time className="text-lg font-semibold text-slate-800 tracking-tight">
                              {formatFecha(r.fecha)}
                            </time>
                            <span className="text-lg font-semibold text-slate-700 tabular-nums">
                              {r.hora || '—'}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              r.pos === 'depie'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {r.pos === 'depie' ? 'De pie' : r.pos === 'sentado' ? 'Sentado' : r.pos}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {escalasZonas.map((zona) => (
                            <div
                              key={zona.label}
                              className={`rounded-lg border px-4 py-2.5 text-base ${zona.bg}`}
                            >
                              <div className="flex flex-wrap items-center gap-y-2">
                                {zona.fields.map(({ key, label }, idx) => (
                                  <React.Fragment key={key}>
                                    {idx > 0 && (
                                      <span className="text-slate-400 font-light" aria-hidden> - </span>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-slate-500 font-medium">{label}</span>
                                      <span className="font-semibold tabular-nums text-slate-800 min-w-[1.25rem]">
                                        {r[key] ?? '—'}
                                      </span>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

        {viewMode === 'form' && (
          <PostOpForm
            data={formData}
            setData={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={saveLoading}
          />
        )}
        </div>
      </main>

      {saveLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            <span className="text-gray-700">Guardando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostOpPage;
