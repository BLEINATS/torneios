import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLink: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0, y: -50 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      className="fixed top-6 right-6 z-50"
    >
      <Link
        to="/admin"
        className="bg-brand-yellow text-gray-900 rounded-full p-4 shadow-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 transition-transform transform hover:scale-110"
        aria-label="Painel de Administração"
        title="Painel de Administração"
      >
        <Shield size={28} />
      </Link>
    </motion.div>
  );
};

export default AdminLink;
