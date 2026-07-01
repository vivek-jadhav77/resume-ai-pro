import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// Pages where nav links should NOT be shown (public pages)
const PUBLIC_ROUTES = ['/', '/login', '/register'];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isPublicPage = PUBLIC_ROUTES.includes(location.pathname);

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
               <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
                ResumeAI<span className="font-light">Pro</span>
              </Link>
            </div>
          </div>

          {/* Only show nav links on protected pages when user is logged in */}
          {!isPublicPage && user && (
            <div className="flex items-center space-x-5">
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
