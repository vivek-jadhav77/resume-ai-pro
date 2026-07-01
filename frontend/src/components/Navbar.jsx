import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "text-indigo-600 font-bold transition text-sm border-b-2 border-indigo-600 pb-1"
      : "text-gray-600 hover:text-indigo-600 transition text-sm font-medium pb-1 border-b-2 border-transparent hover:border-indigo-300";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
               <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
                ResumeAI<span className="font-light">Pro</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            {user ? (
              <>
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
                <Link to="/upload" className={getLinkClass('/upload')}>Upload</Link>
                <Link to="/analyze" className={getLinkClass('/analyze')}>ATS Match</Link>
                <Link to="/optimize" className={getLinkClass('/optimize')}>Optimizer</Link>
                <Link to="/interview" className={getLinkClass('/interview')}>Interview</Link>
                <Link to="/cover-letter" className={getLinkClass('/cover-letter')}>Cover Letter</Link>
                <Link to="/analytics" className={getLinkClass('/analytics')}>Insights</Link>
                <button
                  onClick={logout}
                  className="bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-lg text-sm font-bold transition ml-2 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition">Login</Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-lg font-bold transition shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
