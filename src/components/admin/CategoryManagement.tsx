import React from 'react';
import { useData } from '../../context/DataContext';
import CategoryCard from './CategoryCard';

const CategoryManagement: React.FC = () => {
  const { selectedTournament } = useData();

  if (!selectedTournament) {
    return <p className="text-center text-gray-400">Carregando torneio...</p>;
  }

  return (
    <div className="space-y-6">
      {selectedTournament.categories.length > 0 ? (
        selectedTournament.categories.map(category => (
          <CategoryCard 
            key={category.id} 
            category={category} 
            tournament={selectedTournament} 
          />
        ))
      ) : (
        <div className="bg-gray-800/50 p-8 rounded-lg text-center text-gray-400">
          <p>Este torneio ainda não tem categorias cadastradas.</p>
          <p className="mt-2">Volte para a tela de gerenciamento de torneios para adicionar categorias.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
