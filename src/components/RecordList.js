import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import ExportDialog from './ExportDialog';

const RecordList = ({ 
  records, 
  loading, 
  onEdit, 
  onDelete, 
  onCreateNew 
}) => {
  const [showExportDialog, setShowExportDialog] = useState(false);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('is-IS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return timeStr || '--:--';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registros</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExportDialog(true)}
            disabled={records.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Exportar Excel
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            Nuevo registro
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-4">No hay registros todavía</div>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mx-auto"
          >
            <Plus size={16} />
            Crear primer registro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <RecordCard 
              key={record._id}
              record={record}
              onEdit={() => onEdit(record)}
              onDelete={() => onDelete(record._id)}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}

      <ExportDialog
        records={records}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
};

const RecordCard = ({ record, onEdit, onDelete, formatDate, formatTime }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {formatDate(record.date)}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 p-1"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Lekar:</span>
          <span className="text-sm text-gray-800 font-semibold">
            {record['fjöldi leka'] || 0}
          </span>
        </div>

        {record.upplýsingar?.hvar && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Hvar:</span>
            <span className="text-sm text-gray-800">{record.upplýsingar.hvar}</span>
          </div>
        )}

        {record.upplýsingar?.kaffi > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Kaffi:</span>
            <span className="text-sm text-gray-800">{record.upplýsingar.kaffi}</span>
          </div>
        )}

        {(record.upplýsingar?.áfengi?.bjór > 0 || 
          record.upplýsingar?.áfengi?.vín > 0 || 
          record.upplýsingar?.áfengi?.annar > 0) && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Áfengi:</span>
            <span className="text-sm text-gray-800">
              {(record.upplýsingar.áfengi.bjór || 0) + 
               (record.upplýsingar.áfengi.vín || 0) + 
               (record.upplýsingar.áfengi.annar || 0)}
            </span>
          </div>
        )}

        {record.upplýsingar?.æfing > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Æfing:</span>
            <span className="text-sm text-gray-800">
              {record.upplýsingar.æfing === 1 ? 'Létt' : 'Þung'}
            </span>
          </div>
        )}

        {record.lát && record.lát.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Lát:</span>
            <span className="text-sm text-gray-800">{record.lát.length}</span>
          </div>
        )}

        {record.lekar && record.lekar.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-2">Lekar detallar:</div>
            {record.lekar.slice(0, 3).map((leak, index) => (
              <div key={index} className="text-xs text-gray-500 flex justify-between">
                <span>{formatTime(leak.tími)}</span>
                <span>Styrkur: {leak.styrkur}</span>
                {leak.aðvarun && <span className="text-orange-600">⚠️</span>}
              </div>
            ))}
            {record.lekar.length > 3 && (
              <div className="text-xs text-gray-400 mt-1">
                +{record.lekar.length - 3} fleiri...
              </div>
            )}
          </div>
        )}

        {record.athugasemd && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-1">Athugasemd:</div>
            <div className="text-sm text-gray-700 line-clamp-2">
              {record.athugasemd}
            </div>
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        {record.upplýsingar?.sðl && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">SÐL</span>
        )}
        {record.upplýsingar?.natft && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Natft</span>
        )}
        {record.upplýsingar?.bl && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">BL</span>
        )}
        {record.upplýsingar?.pap && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Pap</span>
        )}
      </div>
    </div>
  );
};

export default RecordList;