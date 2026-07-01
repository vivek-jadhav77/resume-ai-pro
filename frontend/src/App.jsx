import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ATSAnalysis from './pages/ATSAnalysis';
import InterviewQuestions from './pages/InterviewQuestions';
import CoverLetter from './pages/CoverLetter';
import Optimizer from './pages/Optimizer';
import AdminAnalytics from './pages/AdminAnalytics';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="analyze" element={<ProtectedRoute><ATSAnalysis /></ProtectedRoute>} />
            <Route path="interview" element={<ProtectedRoute><InterviewQuestions /></ProtectedRoute>} />
            <Route path="cover-letter" element={<ProtectedRoute><CoverLetter /></ProtectedRoute>} />
            <Route path="optimize" element={<ProtectedRoute><Optimizer /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
