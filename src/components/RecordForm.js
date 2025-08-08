import React from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';

const RecordForm = ({ 
  record, 
  setRecord, 
  onSave, 
  onCancel, 
  loading 
}) => {
  const formatDateWithWeekday = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('is-IS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const addLeak = () => {
    setRecord(prev => ({
      ...prev,
      lekar: [...prev.lekar, { tími: '', aðvarun: false, styrkur: 1, þörf: 0 }]
    }));
  };

  const removeLeak = (index) => {
    setRecord(prev => ({
      ...prev,
      lekar: prev.lekar.filter((_, i) => i !== index)
    }));
  };

  const updateLeak = (index, field, value) => {
    setRecord(prev => ({
      ...prev,
      lekar: prev.lekar.map((leak, i) => 
        i === index ? { ...leak, [field]: value } : leak
      )
    }));
  };

  const addLát = () => {
    setRecord(prev => ({
      ...prev,
      lát: [...prev.lát, { tími: '', flaedi: 0 }]
    }));
  };

  const removeLát = (index) => {
    setRecord(prev => ({
      ...prev,
      lát: prev.lát.filter((_, i) => i !== index)
    }));
  };

  const updateLát = (index, field, value) => {
    setRecord(prev => ({
      ...prev,
      lát: prev.lát.map((lat, i) => 
        i === index ? { ...lat, [field]: value } : lat
      )
    }));
  };

  const updateUpplýsingar = (field, value) => {
    setRecord(prev => ({
      ...prev,
      upplýsingar: { ...prev.upplýsingar, [field]: value }
    }));
  };

  const updateÆfing = (field, value) => {
    setRecord(prev => ({
      ...prev,
      upplýsingar: {
        ...prev.upplýsingar,
        æfing: { ...prev.upplýsingar.æfing, [field]: value }
      }
    }));
  };

  const updateÁfengi = (field, value) => {
    setRecord(prev => ({
      ...prev,
      upplýsingar: {
        ...prev.upplýsingar,
        áfengi: { ...prev.upplýsingar.áfengi, [field]: value }
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {record._id ? 'Editar registro' : 'Nuevo registro'}
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

      {/* Date */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha
        </label>
        <input
          type="date"
          value={record.date}
          onChange={(e) => setRecord(prev => ({ ...prev, date: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {record.date && (
          <div className="mt-2 text-sm text-gray-600">
            {formatDateWithWeekday(record.date)}
          </div>
        )}
      </div>

      {/* Upplýsingar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Upplýsingar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hvar</label>
            <input
              type="text"
              value={record.upplýsingar.hvar}
              onChange={(e) => updateUpplýsingar('hvar', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kaffi</label>
            <input
              type="number"
              min="0"
              value={record.upplýsingar.kaffi}
              onChange={(e) => updateUpplýsingar('kaffi', parseInt(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Æfing</label>
            <select
              value={record.upplýsingar.æfing?.type || 'nej'}
              onChange={(e) => updateÆfing('type', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="nej">nej</option>
              <option value="Dir">Dir</option>
              <option value="labba">labba</option>
              <option value="annað">annað</option>
            </select>
            {record.upplýsingar.æfing?.type === 'labba' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Km</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={record.upplýsingar.æfing?.km || ''}
                  onChange={(e) => updateÆfing('km', parseFloat(e.target.value) || null)}
                  placeholder="N,m"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Áfengi */}
        <div className="mt-4">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Áfengi</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bjór</label>
              <input
                type="number"
                min="0"
                value={record.upplýsingar.áfengi.bjór}
                onChange={(e) => updateÁfengi('bjór', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vín</label>
              <input
                type="number"
                min="0"
                value={record.upplýsingar.áfengi.vín}
                onChange={(e) => updateÁfengi('vín', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annar</label>
              <input
                type="number"
                min="0"
                value={record.upplýsingar.áfengi.annar}
                onChange={(e) => updateÁfengi('annar', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="mt-4">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Tímar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['sið lio', 'Sið Lio'],
              ['kvöldmatur', 'Kvöldmatur'],
              ['lip-riv', 'Sið Lip-Riv'],
              ['sið lát', 'Sið lát'],
              ['að sofa', 'Að sofa']
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <input
                  type="time"
                  value={record.upplýsingar[key]}
                  onChange={(e) => updateUpplýsingar(key, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Boolean fields */}
        <div className="mt-4">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Aðrir þættir</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['sðl', 'SÐL'],
              ['natft', 'Natft'],
              ['bl', 'BL'],
              ['pap', 'Pap']
            ].map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={record.upplýsingar[key]}
                  onChange={(e) => updateUpplýsingar(key, e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Lekar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Lekar</h3>
          <button
            onClick={addLeak}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            Bæta við
          </button>
        </div>
        
        {record.lekar.map((leak, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Leki #{index + 1}</span>
              <button
                onClick={() => removeLeak(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tími</label>
                <input
                  type="time"
                  value={leak.tími}
                  onChange={(e) => updateLeak(index, 'tími', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Styrkur</label>
                <select
                  value={leak.styrkur}
                  onChange={(e) => updateLeak(index, 'styrkur', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Létt</option>
                  <option value={2}>2 - Miðlungs</option>
                  <option value={3}>3 - Sterkt</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Þörf</label>
                <select
                  value={leak.þörf}
                  onChange={(e) => updateLeak(index, 'þörf', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0 - Engin</option>
                  <option value={1}>1 - Einhver</option>
                  <option value={2}>2 - Mikil</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={leak.aðvarun}
                    onChange={(e) => updateLeak(index, 'aðvarun', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aðvarun</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lát */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Lát</h3>
          <button
            onClick={addLát}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={16} />
            Bæta við
          </button>
        </div>
        
        {record.lát.map((lat, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Lát #{index + 1}</span>
              <button
                onClick={() => removeLát(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tími</label>
                <input
                  type="time"
                  value={lat.tími}
                  onChange={(e) => updateLát(index, 'tími', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flaedi</label>
                <select
                  value={lat.flaedi}
                  onChange={(e) => updateLát(index, 'flaedi', parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0 - Ekkert</option>
                  <option value={1}>1 - Miðlungs</option>
                  <option value={2}>2 - Mikið</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Athugasemd */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Athugasemd</h3>
        <textarea
          value={record.athugasemd}
          onChange={(e) => setRecord(prev => ({ ...prev, athugasemd: e.target.value }))}
          placeholder="Aðrar athugasemdir um daginn..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default RecordForm;