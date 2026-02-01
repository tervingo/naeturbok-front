import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostOpForm, { initialPostOp } from './PostOpForm';
import ApiService from '../services/api';
import { ArrowLeft, Plus } from 'lucide-react';

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  try {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return fecha;
  }
};

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

      <main className="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {savedMessage && viewMode === 'list' && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            Registro guardado correctamente.
          </div>
        )}

        {viewMode === 'list' && (
          <>
            {listLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : records.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No hay registros. Pulsa «Nuevo registro» para añadir uno.
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {records.map((r) => (
                    <li
                      key={r._id}
                      className="px-4 py-3 sm:px-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    >
                      <span className="font-medium text-gray-900 whitespace-nowrap">
                        {formatFecha(r.fecha)} {r.hora || ''}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {r.pos === 'depie' ? 'De pie' : r.pos === 'sentado' ? 'Sentado' : r.pos}
                      </span>
                      <span className="text-gray-500">
                        or-gan:{r['or-gan'] ?? '—'} or-ur:{r['or-ur'] ?? '—'} or-ch:{r['or-ch'] ?? '—'} or-vol:{r['or-vol'] ?? '—'} or-mp:{r['or-mp'] ?? '—'} or-mlk:{r['or-mlk'] ?? '—'} or-spv:{r['or-spv'] ?? '—'}
                      </span>
                      <span className="text-gray-500">hec:{r.hec ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
