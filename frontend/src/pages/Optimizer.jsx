import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const Optimizer = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizedData, setOptimizedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resume');
        setResumes(res.data);
        if (res.data.length > 0) setSelectedResume(res.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResumes();
  }, []);

  const handleOptimize = async (e) => {
    e.preventDefault();
    if (!selectedResume || !jobDescription) {
      setError('Please provide a resume and job description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/optimize', {
        resumeId: selectedResume,
        jobDescriptionText: jobDescription
      });
      
      const jobId = res.data.jobId;
      
      // Polling mechanism
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/ai/jobs/${jobId}`);
          if (statusRes.data.status === 'completed') {
            clearInterval(pollInterval);
            setOptimizedData(statusRes.data.result);
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
      setError(err.response?.data?.error || 'Failed to start optimization job');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume Optimizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleOptimize} className="space-y-4">
            {error && <div className="text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Resume</label>
              <select 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea 
                rows="6"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description you want to optimize for..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Optimizing...' : 'Optimize Bullet Points'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold mb-4">General Tips</h2>
          {optimizedData ? (
            <ul className="space-y-2 text-gray-700">
              {optimizedData.generalTips?.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span> {tip}
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex-grow flex items-center justify-center text-gray-400">
                Run the optimizer to see specific tips.
             </div>
          )}
        </div>
      </div>

      {optimizedData && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Optimized Experience</h2>
          <div className="space-y-6">
            {optimizedData.optimizedExperience?.map((exp, i) => (
              <div key={i} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded border border-red-100">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Original</p>
                    <p className="text-gray-700 text-sm">{exp.original}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-100 relative">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Optimized</p>
                    <p className="text-gray-800 text-sm font-medium">{exp.optimized}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(exp.optimized)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-green-600"
                      title="Copy"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Optimizer;
