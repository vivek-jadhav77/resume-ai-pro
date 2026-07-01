import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const CoverLetter = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResume || !jobDescription) {
      setError('Please provide a resume and job description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/cover-letter', {
        resumeId: selectedResume,
        jobDescriptionText: jobDescription,
        company
      });
      
      const jobId = res.data.jobId;

      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/ai/jobs/${jobId}`);
          if (statusRes.data.status === 'completed') {
            clearInterval(pollInterval);
            setCoverLetter(statusRes.data.result.coverLetter);
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
      setError(err.response?.data?.error || 'Failed to start cover letter job');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Cover Letter Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleGenerate} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea 
                rows="8"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Result</h2>
            {coverLetter && (
              <button 
                onClick={copyToClipboard}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
          
          <div className="flex-grow bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap font-sans text-gray-800 h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 animate-pulse">Drafting your perfect letter...</p>
              </div>
            ) : coverLetter ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {coverLetter}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">Your generated cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
