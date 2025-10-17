import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { ChevronLeft, Users, Settings, DollarSign, GitMerge } from 'lucide-react';
import CategoryManagement from '../components/admin/CategoryManagement';
import Configuration from '../components/admin/Configuration';
import TournamentCreation from '../components/admin/TournamentCreation';
import SponsorManagement from '../components/admin/SponsorManagement';
import BracketingManagement from '../components/admin/BracketingManagement';

const Admin: React.FC = () => {
  const { selectedTournament, selectTournament, secondaryTextColor } = useData();
  const [activeTab, setActiveTab] = useState<'categories' | 'bracketing' | 'sponsors' | 'config'>('categories');

  if (!selectedTournament) {
    return <TournamentCreation />;
  }

  const TabButton: React.FC<{ tabName: 'categories' | 'bracketing' | 'sponsors' | 'config'; children: React.ReactNode }> = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold transition-colors ${
        activeTab === tabName
          ? 'bg-gray-800/50 text-brand-yellow'
          : 'bg-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="p-6 pt-32 h-full container mx-auto text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => selectTournament(null)} className="flex items-center gap-2 text-brand-yellow font-bold mb-4">
            <ChevronLeft size={20} />
            Voltar para seleção de torneios
        </button>
        <h2 className="text-4xl font-black text-shadow-md mb-2" style={{ color: secondaryTextColor }}>Painel de Administração</h2>
        <p className="text-2xl text-white text-shadow-md mb-8">{selectedTournament.name}</p>
        
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <TabButton tabName="categories"><Users size={18} /> Categorias e Inscritos</TabButton>
          <TabButton tabName="bracketing"><GitMerge size={18} /> Chaveamento</TabButton>
          <TabButton tabName="sponsors"><DollarSign size={18} /> Patrocinadores</TabButton>
          <TabButton tabName="config"><Settings size={18} /> Configurações</TabButton>
        </div>

        <div className="bg-gray-800/50 rounded-b-lg p-6">
          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'bracketing' && <BracketingManagement />}
          {activeTab === 'sponsors' && <SponsorManagement />}
          {activeTab === 'config' && <Configuration />}
        </div>
      </motion.div>
    </div>
  );
};

export default Admin;
