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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
        <div className="space-y-3">
          {records.map((record) => (
            <RecordBar 
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

const RecordBar = ({ record, onEdit, onDelete, formatDate, formatTime }) => {
  const lekarCount = record['fjöldi leka'] || 0;
  const latCount = record.lát?.length || 0;
  
  // Check if any lekar has styrkur > 1
  const hasStrongLekar = record.lekar && record.lekar.some(leak => leak.styrkur > 1);
  
  let bgStyle, textColor;
  
  if (record.ready === false) {
    bgStyle = { backgroundColor: 'slategray', borderColor: '#86efac' };
    textColor = 'text-white';
  } else if (lekarCount === 0 && latCount === 1) {
    bgStyle = { backgroundColor: 'aqua', borderColor: '#67e8f9' };
    textColor = 'text-cyan-800';
  } else if (lekarCount === 0) {
    bgStyle = { backgroundColor: 'limegreen', borderColor: '#86efac' };
    textColor = 'text-green-800';
  } else if (lekarCount === 1 && !hasStrongLekar) {
    // 1 lekar with all styrkur = 1 (létt)
    bgStyle = { backgroundColor: 'lightsalmon', borderColor: '#fca5a5' };
    textColor = 'text-red-800';
  } else if (lekarCount > 2 || hasStrongLekar) {
    // More than 2 lekar OR any lekar with styrkur > 1
    bgStyle = { backgroundColor: 'tomato', borderColor: '#fca5a5' };
    textColor = 'text-red-800';
  } else {
    // Default case (lekarCount = 2 with all styrkur = 1)
    bgStyle = { backgroundColor: 'salmon', borderColor: '#fca5a5' };
    textColor = 'text-red-800';
  }
  
  return (
    <div 
      className="border rounded-lg p-4 hover:shadow-md transition-shadow" 
      style={bgStyle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-200 truncate">
              {formatDate(record.date)}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-600">Lekar:</span>
            <span className={`text-sm font-bold ${textColor}`}>
              {lekarCount}
            </span>
          </div>

          {record.upplýsingar?.hvar && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Hvar:</span>
              <span className="text-sm text-gray-800">{record.upplýsingar.hvar}</span>
            </div>
          )}

          {record.upplýsingar?.kaffi > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Kaffi:</span>
              <span className="text-sm text-gray-800">{record.upplýsingar.kaffi}</span>
            </div>
          )}

          {(record.upplýsingar?.áfengi?.bjór > 0 || 
            record.upplýsingar?.áfengi?.vín > 0 || 
            record.upplýsingar?.áfengi?.annar > 0) && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Áfengi:</span>
              <span className="text-sm text-gray-800">
                {(record.upplýsingar.áfengi.bjór || 0) + 
                 (record.upplýsingar.áfengi.vín || 0) + 
                 (record.upplýsingar.áfengi.annar || 0)}
              </span>
            </div>
          )}

          {record.upplýsingar?.æfing && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Æfing:</span>
              <span className="text-sm text-gray-800">
                {record.upplýsingar.æfing.type}
                {record.upplýsingar.æfing.type === 'labba' && record.upplýsingar.æfing.km && 
                  ` (${record.upplýsingar.æfing.km} km)`}
              </span>
            </div>
          )}

          {record.lát && record.lát.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600">Lát:</span>
              <span className="text-sm text-gray-800">{record.lát.length}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
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
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-3 py-1 rounded text-sm font-medium transition-colors"
            title="Editar"
          >
            <Edit size={14} />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium transition-colors"
            title="Eliminar"
          >
            <Trash2 size={14} />
            Borrar
          </button>
        </div>
      </div>

{/*       {record.athugasemd && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            <strong>Athugasemd:</strong> {record.athugasemd}
          </div>
        </div>
      )} 

      {record.lekar && record.lekar.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">Lekar detallar:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {record.lekar.slice(0, 6).map((leak, index) => (
              <div key={index} className="text-xs text-gray-500 flex justify-between bg-white rounded px-2 py-1">
                <span>{formatTime(leak.tími)}</span>
                <span>Styrkur: {leak.styrkur}</span>
                {leak.aðvarun && <span className="text-orange-600">⚠️</span>}
              </div>
            ))}
          </div>
          {record.lekar.length > 6 && (
            <div className="text-xs text-gray-400 mt-2">
              +{record.lekar.length - 6} fleiri lekar...
            </div>
          )}
        </div>
      )}
      */}
    </div>
  );
};

export default RecordList;