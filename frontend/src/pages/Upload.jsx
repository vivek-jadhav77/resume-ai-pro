import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      setError('');
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Resume</h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleUpload}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition cursor-pointer">
            <input 
              type="file" 
              accept=".pdf,.docx,.doc" 
              onChange={handleFileChange} 
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 font-medium text-lg">Click to select or drag and drop</p>
              <p className="text-gray-500 text-sm mt-1">PDF or DOCX (Max 5MB)</p>
            </label>
            {file && <p className="mt-4 text-indigo-600 font-medium">Selected: {file.name}</p>}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Uploading & Analyzing (This takes a moment)...' : 'Upload Resume'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
