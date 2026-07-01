import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsRes = await api.get('/ai/reports');
        setReports(reportsRes.data);
        if (reportsRes.data.length > 0) {
          setSelectedReportId(reportsRes.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedReport = reports.find(r => r._id === selectedReportId) || reports[0] || null;

  // Breakdown data
  const breakdownData = selectedReport?.scoreBreakdown ? [
    { name: 'Skills Match', score: selectedReport.scoreBreakdown.skills || 0, max: 40 },
    { name: 'Projects Relevance', score: selectedReport.scoreBreakdown.projects || 0, max: 25 },
    { name: 'Experience Relevance', score: selectedReport.scoreBreakdown.experience || 0, max: 20 },
    { name: 'Education Match', score: selectedReport.scoreBreakdown.education || 0, max: 10 },
    { name: 'Resume Quality', score: selectedReport.scoreBreakdown.quality || 0, max: 5 },
  ] : [];

  // Skill coverage pie
  const matchedCount = selectedReport?.matchedSkills?.length || 0;
  const criticalMissing = selectedReport?.criticalMissingSkills?.length || 0;
  const importantMissing = selectedReport?.importantMissingSkills?.length || 0;
  const optionalMissing = selectedReport?.optionalSkills?.length || 0;
  const totalMissing = criticalMissing + importantMissing + optionalMissing;

  const coverageData = [
    { name: 'Matched', value: matchedCount, color: '#10b981' },
    { name: 'Missing', value: totalMissing, color: '#f59e0b' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recruiter Insights</h1>
        <p className="text-gray-500 mt-1">Deep-dive into candidate fit, practical experience, and ATS compatibility.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-lg">No ATS scans found.</p>
          <Link to="/analyze" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
            Run your first ATS scan →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Scan Selector Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-fit">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Analysis History</h2>
            <div className="space-y-1 overflow-y-auto max-h-[500px] pr-1">
              {reports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReportId(report._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-center ${
                    selectedReportId === report._id
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm truncate max-w-[140px]">{report.roleDetected || 'Job Scan'}</p>
                    <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    report.atsScore >= 90
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : report.atsScore >= 75
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : report.atsScore >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {report.atsScore}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {selectedReport && (
                <motion.div
                  key={selectedReport._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Executive Summary Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] bg-white/20 text-white font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md">
                          Executive Summary
                        </span>
                        <p className="text-xs text-indigo-200 font-medium">Scanned: {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedReport.roleDetected || 'Target Role'}</h2>
                      
                      {selectedReport.executiveSummary ? (
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                          {selectedReport.executiveSummary}
                        </p>
                      ) : (
                        <p className="text-indigo-200 text-sm italic mb-4">Executive summary is generating or unavailable for this scan.</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-indigo-500/30">
                        <div className="flex flex-col">
                          <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold mb-1">ATS Score Band</p>
                          <p className={`text-lg font-black ${selectedReport.atsScore >= 75 ? 'text-emerald-400' : selectedReport.atsScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {selectedReport.scoreBand || 'Unknown'} ({selectedReport.atsScore}%)
                          </p>
                        </div>
                        <div className="w-px bg-indigo-500/30"></div>
                        <div className="flex flex-col">
                          <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold mb-1 flex items-center gap-1">
                            Analysis Quality
                            <span title="Based on resume parsing clarity, JD detail, and match consistency." className="cursor-help text-indigo-200 border border-indigo-400/50 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-bold">?</span>
                          </p>
                          <p className="text-lg font-black text-white">
                            {selectedReport.analysisQuality || 'Moderate'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown + Strengths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* ATS Score Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Transparent Scoring Breakdown</h3>
                      <div className="space-y-4">
                        {breakdownData.map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="text-indigo-600">{item.score} <span className="text-gray-400">/ {item.max}</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full ${item.score / item.max >= 0.8 ? 'bg-emerald-500' : item.score / item.max >= 0.5 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                                style={{ width: `${(item.score / item.max) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Strengths */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Key Candidate Strengths
                      </h3>
                      {selectedReport.strengths?.length > 0 ? (
                        <ul className="space-y-3">
                          {selectedReport.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-700 bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-xl flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-xs text-gray-400 italic">No strengths generated.</p>}
                    </div>
                  </div>

                  {/* Skills Match & Gap Analysis */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-gray-800">Skills Match & Gap Analysis</h3>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{matchedCount} Matched</span>
                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">{totalMissing} Missing</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Matched */}
                      {matchedCount > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">✓ Verified Skills ({matchedCount})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedReport.matchedSkills.map((sk, i) => (
                              <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">{sk}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Explanations Wrapper */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        {/* Critical Missing */}
                        <div>
                          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3">✗ Critical Missing ({criticalMissing})</p>
                          {criticalMissing > 0 ? (
                            <div className="space-y-3">
                              {selectedReport.criticalMissingSkills.map((sk, i) => {
                                const explanation = (selectedReport.missingSkillExplanations || []).find(e => e.skill.toLowerCase() === sk.toLowerCase());
                                return (
                                  <div key={i} className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                                    <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded shadow-sm mb-1">{sk}</span>
                                    {explanation ? (
                                      <p className="text-xs text-gray-600 mt-1 leading-relaxed"><span className="font-semibold text-gray-700">Context:</span> {explanation.reason}</p>
                                    ) : (
                                      <p className="text-xs text-gray-400 mt-1 italic">Core requirement for this position.</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : <p className="text-xs text-gray-400 italic">No critical skills missing!</p>}
                        </div>

                        {/* Important & Optional Missing */}
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-3">⚡ Important & Optional Missing</p>
                          
                          {importantMissing > 0 && (
                            <div className="space-y-3 mb-4">
                              {selectedReport.importantMissingSkills.map((sk, i) => {
                                const explanation = (selectedReport.missingSkillExplanations || []).find(e => e.skill.toLowerCase() === sk.toLowerCase());
                                return (
                                  <div key={i} className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                                    <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm mb-1">{sk}</span>
                                    {explanation && (
                                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{explanation.reason}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {optionalMissing > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {selectedReport.optionalSkills.map((sk, i) => (
                                <span key={i} className="bg-gray-50 text-gray-600 border border-gray-200 text-[10px] font-medium px-2 py-1 rounded-md">{sk}</span>
                              ))}
                            </div>
                          )}

                          {importantMissing === 0 && optionalMissing === 0 && (
                            <p className="text-xs text-gray-400 italic">No secondary skills missing!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Recommendations */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Recruiter Recommendations & Action Items
                    </p>
                    {selectedReport.suggestions?.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedReport.suggestions.filter(s => !s.includes('temporarily unavailable')).map((s, i) => (
                          <li key={i} className="text-sm text-gray-700 bg-indigo-50/30 border border-indigo-100/50 p-3.5 rounded-xl flex items-start gap-2 leading-relaxed">
                            <span className="text-indigo-500 font-bold mt-0.5">→</span>{s}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs text-gray-400 italic">No suggestions generated.</p>}
                    
                    <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
                      <Link
                        to="/analyze"
                        state={{ resumeId: selectedReport.resumeId?._id || selectedReport.resumeId }}
                        className="text-xs bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-5 py-2.5 rounded-lg transition shadow-sm"
                      >
                        Rescan & Re-analyze
                      </Link>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
