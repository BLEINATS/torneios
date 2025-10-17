import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Trophy, SlidersHorizontal } from 'lucide-react';

const TournamentNav: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap ${
      isActive
        ? 'bg-brand-yellow text-gray-900'
        : 'bg-gray-800 bg-opacity-50 text-white hover:bg-gray-700'
    }`;

  if (!tournamentId) return null;

  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 bg-black bg-opacity-30 p-2 rounded-xl">
        <NavLink to={`/tournament/${tournamentId}`} end className={navLinkClasses}>
          <LayoutDashboard size={20} />
          Placar
        </NavLink>
        <NavLink to={`/tournament/${tournamentId}/bracket`} className={navLinkClasses}>
          <GitMerge size={20} />
          Confrontos
        </NavLink>
        <NavLink to={`/tournament/${tournamentId}/control`} className={navLinkClasses}>
          <SlidersHorizontal size={20} />
          Gerenciar
        </NavLink>
        <NavLink to={`/tournament/${tournamentId}/results`} className={navLinkClasses}>
          <Trophy size={20} />
          Resultados
        </NavLink>
      </div>
    </div>
  );
};

export default TournamentNav;
