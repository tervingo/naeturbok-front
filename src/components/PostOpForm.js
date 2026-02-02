import React from 'react';
import { Save, X } from 'lucide-react';

const initialPostOp = () => ({
  fecha: new Date().toISOString().slice(0, 10),
  hora: new Date().toTimeString().slice(0, 5),
  pos: 'depie',
  'or-gan': 0,
  'or-ur': 0,
  'or-ch': 0,
  'or-vol': 0,
  'or-mp': 'no',
  'mp-por': '',
  'or-mlk': 0,
  'or-spv': 0,
  dol: 0,
  hec: 0,
  ingesta: '',
  'ingesta-cantidad': '',
  medicación: '',
});

const PostOpForm = ({ data, setData, onSave, onCancel, loading, isEditing }) => {
  const update = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar registro PostOp' : 'Nuevo registro PostOp'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            <X size={16} />
            Cancelar
          </button>
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input
            type="date"
            value={data.fecha || ''}
            onChange={(e) => update('fecha', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora (local)</label>
          <input
            type="time"
            value={data.hora || ''}
            onChange={(e) => update('hora', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Posición */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Posición (pos)</label>
        <select
          value={data.pos || 'depie'}
          onChange={(e) => update('pos', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="depie">De pie</option>
          <option value="sentado">Sentado</option>
        </select>
      </div>

      {/* Escalas or-* (0-2, 0-3, 0-10) */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Escalas (or-*)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-gan (0 | 0,5 | 1 | 2)</label>
            <select
              value={String(data['or-gan'] ?? 0)}
              onChange={(e) => update('or-gan', parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 0.5, 1, 2].map((n) => (
                <option key={n} value={n}>{Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-ur (0–2)</label>
            <select
              value={data['or-ur'] ?? 0}
              onChange={(e) => update('or-ur', parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 1, 2].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-ch (0 | 0,5 | 1 | 1,5 | 2 | 3)</label>
            <select
              value={String(data['or-ch'] ?? 0)}
              onChange={(e) => update('or-ch', parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 0.5, 1, 1.5, 2, 3].map((n) => (
                <option key={n} value={n}>{Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-vol (0 | 0,5 | 1 | 1,5 | 2 | 3)</label>
            <select
              value={String(data['or-vol'] ?? 0)}
              onChange={(e) => update('or-vol', parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[0, 0.5, 1, 1.5, 2, 3].map((n) => (
                <option key={n} value={n}>{Number.isInteger(n) ? n : n.toFixed(1).replace('.', ',')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-mp</label>
            <select
              value={data['or-mp'] ?? 'no'}
              onChange={(e) => {
                const v = e.target.value;
                update('or-mp', v === 'no' ? 'no' : parseInt(v, 10));
                if (v === 'no') update('mp-por', '');
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="no">no</option>
              {[0, 1, 2].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          {(data['or-mp'] !== 'no' && data['or-mp'] !== undefined && data['or-mp'] !== '') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">mp-por</label>
              <select
                value={data['mp-por'] ?? 'nada'}
                onChange={(e) => update('mp-por', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="tos">tos</option>
                <option value="estornudo">estornudo</option>
                <option value="esfuerzo">esfuerzo</option>
                <option value="otro">otro</option>
                <option value="nada">nada</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-mlk (0–10)</label>
            <select
              value={data['or-mlk'] ?? 0}
              onChange={(e) => update('or-mlk', parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">or-spv (0–10)</label>
            <select
              value={data['or-spv'] ?? 0}
              onChange={(e) => update('or-spv', parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ingesta + Medicación */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingesta y medicación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingesta</label>
            <select
              value={data.ingesta ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                update('ingesta', v);
                if (!v) update('ingesta-cantidad', '');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">—</option>
              <option value="agua">agua</option>
              <option value="agua con gas">agua con gas</option>
              <option value="cerveza">cerveza</option>
              <option value="zumo">zumo</option>
              <option value="leche">leche</option>
              <option value="otros">otros</option>
            </select>
          </div>
          {data.ingesta && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
              <select
                value={data['ingesta-cantidad'] ?? ''}
                onChange={(e) => update('ingesta-cantidad', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">—</option>
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
                  <option key={n} value={`${n} ml`}>{n} ml</option>
                ))}
                <option value="1l">1 l</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medicación</label>
            <select
              value={data.medicación ?? ''}
              onChange={(e) => update('medicación', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">—</option>
              <option value="paracetamol 1mg">paracetamol 1mg</option>
              <option value="iboprufeno 600mg">iboprufeno 600mg</option>
              <option value="antibiótico">antibiótico</option>
            </select>
          </div>
        </div>
      </div>

      {/* dol */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">dol (0–5)</label>
        <select
          value={data.dol ?? 0}
          onChange={(e) => update('dol', parseInt(e.target.value, 10))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* hec */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">hec (0 | 1)</label>
        <select
          value={data.hec ?? 0}
          onChange={(e) => update('hec', parseInt(e.target.value, 10))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={0}>0</option>
          <option value={1}>1</option>
        </select>
      </div>
    </div>
  );
};

export default PostOpForm;
export { initialPostOp };
