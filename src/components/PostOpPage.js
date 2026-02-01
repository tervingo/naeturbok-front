import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PostOpForm, { initialPostOp } from './PostOpForm';
import ApiService from '../services/api';
import { ArrowLeft } from 'lucide-react';

const PostOpPage = () => {
  const [formData, setFormData] = useState(initialPostOp());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await ApiService.createPostop(formData);
      if (res.success) {
        setSaved(true);
        setFormData(initialPostOp());
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFormData(initialPostOp());
    setSaved(false);
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
          </div>
        </div>
      </header>

      <main className="py-6">
        {saved && (
          <div className="max-w-2xl mx-auto px-4 mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
            Registro guardado correctamente.
          </div>
        )}
        <PostOpForm
          data={formData}
          setData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </main>

      {loading && (
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
