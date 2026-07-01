import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight"
      >
        Optimize Your Resume with <span className="text-indigo-600">AI</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl text-gray-500 max-w-3xl"
      >
        Upload your resume, compare it against job descriptions, and get AI-powered suggestions to beat the ATS and land your dream job.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 flex gap-4"
      >
        <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl">
          Get Started for Free
        </Link>
        <Link to="/login" className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition border border-gray-200">
          Login
        </Link>
      </motion.div>
    </div>
  );
};

export default Landing;
