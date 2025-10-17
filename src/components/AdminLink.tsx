import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminLink: React.FC = () => {
  return (
    <Link
      to="/admin"
      className="bg-brand-yellow text-gray-900 rounded-full p-4 shadow-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 transition-transform transform hover:scale-110"
      aria-label="Painel de Administração"
      title="Painel de Administração"
    >
      <Shield size={28} />
    </Link>
  );
};

export default AdminLink;
