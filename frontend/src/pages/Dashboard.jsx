import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/resume');
        setResumes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete resume', err);
      alert('Failed to delete resume');
    }
  };

  const quickActions = [
    { 
      label: 'Upload New Resume', 
      desc: 'Add a new PDF/DOCX to your library',
      to: '/upload', 
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12', 
      color: 'bg-indigo-600',
      hover: 'hover:bg-indigo-700' 
    },
    { 
      label: 'ATS Match Scan', 
      desc: 'Compare a resume against a job description',
      to: '/analyze', 
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
      color: 'bg-emerald-600',
      hover: 'hover:bg-emerald-700' 
    },
    { 
      label: 'Generate Cover Letter', 
      desc: 'Create a tailored cover letter instantly',
      to: '/cover-letter', 
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 
      color: 'bg-violet-600',
      hover: 'hover:bg-violet-700' 
    },
    { 
      label: 'Interview Prep', 
      desc: 'Get technical questions based on your resume',
      to: '/interview', 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 
      color: 'bg-blue-600',
      hover: 'hover:bg-blue-700' 
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Your personal resume intelligence workspace.</p>
        </div>
      </motion.header>

      {/* Prominent Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Launch Workspace Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <motion.div 
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={action.to}
                className={`flex flex-col h-full gap-3 p-5 rounded-2xl text-white transition-all shadow-sm hover:shadow-md ${action.color} ${action.hover}`}
              >
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{action.label}</h3>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Document Library */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Document Library</h2>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-gray-500 font-medium">No resumes uploaded yet.</p>
            <Link to="/upload" className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition">
              Upload your first resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <div key={resume._id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-100 hover:shadow-sm transition bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <a 
                      href={resume.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                    >
                      View File
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <button 
                      onClick={() => handleDelete(resume._id)}
                      className="text-xs text-gray-400 hover:text-red-600 transition ml-3"
                      title="Delete Resume"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate" title={resume.fileName || 'Resume Document'}>
                    {resume.fileName || 'Resume Document'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Uploaded {new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => navigate('/analyze', { state: { resumeId: resume._id } })}
                    className="w-full text-center bg-white border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 text-xs font-bold py-2 rounded-lg transition"
                  >
                    Run ATS Scan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
