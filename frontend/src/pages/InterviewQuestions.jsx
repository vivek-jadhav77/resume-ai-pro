import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

const InterviewQuestions = () => {
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(location.state?.resumeId || '');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resume');
        setResumes(res.data);
        if (!selectedResume && res.data.length > 0) {
          setSelectedResume(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, [selectedResume]);

  const handleGenerate = async () => {
    if (!selectedResume) {
      setError('Please select a resume first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/interview', {
        resumeId: selectedResume
      });
      
      const jobId = res.data.jobId;

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/ai/jobs/${jobId}`);
          if (statusRes.data.status === 'completed') {
            clearInterval(pollInterval);
            setQuestions(statusRes.data.result);
            setLoading(false);
          } else if (statusRes.data.status === 'failed') {
            clearInterval(pollInterval);
            setError(statusRes.data.error || 'Job failed to complete.');
            setLoading(false);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setError('Error checking job status.');
          setLoading(false);
        }
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview questions job.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Interview Prep</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-end gap-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume to base questions on</label>
          <select 
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
          >
            <option value="">-- Choose a Resume --</option>
            {resumes.map(r => (
              <option key={r._id} value={r._id}>
                {r.fileName || 'Resume'} (Uploaded on {new Date(r.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-6 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-50 h-[42px]"
        >
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8">{error}</div>}

      {questions && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Technical Questions */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </span>
              Technical Questions
            </h2>
            <ul className="space-y-4">
              {questions.technical?.map((q, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mr-3 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-700">{q}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Behavioral Questions */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              Behavioral Questions
            </h2>
            <ul className="space-y-4">
              {questions.behavioral?.map((q, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-50 text-purple-600 text-sm font-bold mr-3 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-gray-700">{q}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InterviewQuestions;
