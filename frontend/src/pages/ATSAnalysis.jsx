import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const ATSAnalysis = () => {
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(location.state?.resumeId || '');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
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

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedResume || !jobDescriptionText) {
      setError('Please select a resume and paste a job description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/ai/analyze', {
        resumeId: selectedResume,
        jobTitle,
        company,
        jobDescriptionText
      });
      setReport(res.data.report);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const score = report ? (typeof report.atsScore === 'number' ? report.atsScore : report.matchPercentage) : 0;
  const chartData = report ? [
    { name: 'Match', value: score },
    { name: 'Gap', value: 100 - score }
  ] : [];
  const COLORS = ['#4f46e5', '#e5e7eb'];

  const confidence = report?.confidence || 0;
  const confidenceData = [
    { name: 'Reliability', value: confidence },
    { name: 'Gap', value: 100 - confidence }
  ];
  const CONFIDENCE_COLORS = ['#d97706', '#e5e7eb'];

  const breakdownData = report && report.scoreBreakdown ? [
    { name: 'Critical Skills', score: report.scoreBreakdown.criticalSkills || 0 },
    { name: 'Relevant Exp', score: report.scoreBreakdown.experience || 0 },
    { name: 'Projects', score: report.scoreBreakdown.projects || 0 },
    { name: 'Important Skills', score: report.scoreBreakdown.importantSkills || 0 },
    { name: 'Optional Skills', score: report.scoreBreakdown.optionalSkills || 0 },
    { name: 'Completeness', score: report.scoreBreakdown.completeness || 0 }
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ATS Resume Matcher</h1>
        <p className="text-gray-500 mt-1">Audit your resume compatibility against industry standards and job descriptions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Job Target Setup</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-100">{error}</div>}
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Parsed Resume</label>
              <select 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea 
                rows="8"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job description here..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Analyzing with AI & scoring...' : 'Analyze Match Compatibility'}
            </button>
          </form>
        </div>

        {/* Results Panel Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Analysis Report</h2>
          
          {!report && !loading && (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-100 rounded-lg">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <p>Setup job details and target resume to calculate ATS scores.</p>
            </div>
          )}

          {loading && (
             <div className="flex-grow flex flex-col items-center justify-center space-y-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               <p className="text-sm text-gray-500 font-medium">Running deterministic scanner pipeline...</p>
             </div>
          )}

          {report && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Dual scores circle cards */}
              {report.suggestions && report.suggestions.some(s => s.includes('temporarily unavailable')) && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">AI Services Degraded</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        AI recommendations are temporarily unavailable. However, deterministic Core ATS analysis was completed successfully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {/* Score Circular Chart */}
                <div className="relative flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={34}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                      <p className="text-2xl font-bold text-gray-900">{score}%</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">ATS Score Match</p>
                </div>

                {/* Confidence Circular Chart */}
                <div className="relative flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={confidenceData}
                          innerRadius={34}
                          outerRadius={45}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {confidenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CONFIDENCE_COLORS[index % CONFIDENCE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                      <p className="text-2xl font-bold text-gray-900">{confidence}%</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Analysis Confidence</p>
                </div>
              </div>

              {/* Detected Role Banner */}
              {report.roleDetected && (
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Detected Target Role</p>
                  <p className="text-lg font-bold text-indigo-900 mt-0.5">{report.roleDetected}</p>
                </div>
              )}

              {/* Score Breakdown Bar Chart */}
              {report.scoreBreakdown && (
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Scoring Breakdown</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={breakdownData}
                        layout="vertical"
                        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                      >
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={110} 
                          style={{ fontSize: '11px', fontWeight: '500', fill: '#4b5563' }}
                        />
                        <Tooltip formatter={(value) => [`${value}/100`, 'Score']} />
                        <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Key Strengths */}
              {report.strengths && report.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-700 bg-green-50/50 p-2.5 rounded-lg border border-green-100/50">
                        <span className="text-green-600 mr-2 font-bold">✓</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Analysis */}
              {(report.matchedSkills || report.criticalMissingSkills || report.importantMissingSkills || report.optionalSkills) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Skills Match & Gap Analysis</h3>
                  
                  {/* Matched Skills */}
                  {report.matchedSkills && report.matchedSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        ✓ Matched Skills ({report.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.matchedSkills.map((kw, i) => (
                          <span key={i} className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critical Missing Skills */}
                  {report.criticalMissingSkills && report.criticalMissingSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        ✗ Critical Missing Skills ({report.criticalMissingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.criticalMissingSkills.map((kw, i) => (
                          <span key={i} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-xs font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Skills */}
                  {report.importantMissingSkills && report.importantMissingSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        ⚡ Important Skills ({report.importantMissingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.importantMissingSkills.map((kw, i) => (
                          <span key={i} className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-xs font-semibold">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional Skills */}
                  {report.optionalSkills && report.optionalSkills.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        💡 Optional / Nice-to-Have ({report.optionalSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.optionalSkills.map((kw, i) => (
                          <span key={i} className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {report.suggestions && report.suggestions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recruiter Recommendations</h3>
                  <ul className="space-y-2.5">
                    {report.suggestions.map((sug, i) => {
                      if (sug.includes('temporarily unavailable')) return null;
                      return (
                        <li key={i} className="flex items-start text-sm text-gray-700 bg-indigo-50/30 p-3 rounded-lg border border-indigo-50/50">
                          <span className="text-indigo-600 mr-2.5 font-bold">•</span>
                          {sug}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalysis;
