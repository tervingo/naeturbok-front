import React, { useState, useEffect } from 'react';
import RecordForm from './RecordForm';
import RecordList from './RecordList';
import Statistics from './Statistics';
import ApiService from '../services/api';
import { initializeRecord } from '../utils/helpers';

const TrackingApp = () => {
  const [records, setRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getRecords();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('Error al cargar los registros: ' + error.message);
    }
    setLoading(false);
  };

  const saveRecord = async () => {
    setLoading(true);
    try {
      let data;
      if (currentRecord._id) {
        data = await ApiService.updateRecord(currentRecord._id, currentRecord);
      } else {
        data = await ApiService.createRecord(currentRecord);
      }
      
      if (data.success) {
        await fetchRecords();
        setCurrentRecord(null);
        setIsEditing(false);
        setActiveTab('list');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error al guardar el registro: ' + error.message);
    }
    setLoading(false);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro?')) return;
    
    setLoading(true);
    try {
      const data = await ApiService.deleteRecord(id);
      if (data.success) {
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el registro: ' + error.message);
    }
    setLoading(false);
  };

  const handleCreateNew = () => {
    setCurrentRecord(initializeRecord());
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleCancel = () => {
    setCurrentRecord(null);
    setIsEditing(false);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Tracking App</h1>
            
            {/* Navigation tabs */}
            <nav className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setIsEditing(false);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Registros
              </button>
              <button
                onClick={() => {
                  setActiveTab('charts');
                  setIsEditing(false);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'charts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Estadísticas
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-6">
        {isEditing && currentRecord && (
          <RecordForm
            record={currentRecord}
            setRecord={setCurrentRecord}
            onSave={saveRecord}
            onCancel={handleCancel}
            loading={loading}
          />
        )}
        
        {!isEditing && activeTab === 'list' && (
          <RecordList
            records={records}
            loading={loading}
            onEdit={handleEdit}
            onDelete={deleteRecord}
            onCreateNew={handleCreateNew}
          />
        )}
        
        {activeTab === 'charts' && (
          <Statistics records={records} />
        )}
      </main>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingApp;