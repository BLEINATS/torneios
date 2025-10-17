import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament, TournamentCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { UserPlus, User, Users, X } from 'lucide-react';
import { getParticipantDisplayName } from '../../utils/displayUtils';

interface CategoryCardProps {
  category: TournamentCategory;
  tournament: Tournament;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, tournament }) => {
  const { addTeam } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [teamName, setTeamName] = useState(''); // For 'equipe'
  const [players, setPlayers] = useState<string[]>(['']);

  const { modality, teams, id: tournamentId } = tournament;
  const teamsInCategory = useMemo(() => teams.filter(t => t.categoryId === category.id), [teams, category.id]);

  useEffect(() => {
    if (isAdding) {
      setTeamName('');
      if (modality === 'duplas') {
          setPlayers(['', '']);
      } else {
          setPlayers(['']);
      }
    }
  }, [isAdding, modality]);

  const getPlayerInputCount = () => {
    switch (modality) {
      case 'individual': return 1;
      case 'duplas': return 2;
      case 'equipe': return players.length;
      default: return 1;
    }
  };

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const addPlayerField = () => setPlayers([...players, '']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTeamName: string;
    const finalPlayerNames = players.map(p => p.trim()).filter(Boolean);

    if (modality === 'individual') {
        if (finalPlayerNames.length !== 1) { alert('Por favor, preencha o nome do participante.'); return; }
        finalTeamName = finalPlayerNames[0];
    } else if (modality === 'duplas') {
        if (finalPlayerNames.length !== 2) { alert('Por favor, preencha o nome dos dois jogadores.'); return; }
        finalTeamName = finalPlayerNames.join(' & ');
    } else { // equipe
        finalTeamName = teamName.trim();
        if (!finalTeamName) { alert('Por favor, preencha o nome da equipe.'); return; }
        if (finalPlayerNames.length === 0) { alert('A equipe deve ter pelo menos um jogador.'); return; }
    }
    
    addTeam(tournamentId, category.id, finalTeamName, finalPlayerNames);
    setIsAdding(false);
  };

  const playerInputs = Array.from({ length: getPlayerInputCount() });

  const buttonClass = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white capitalize">{category.group} - {category.level}</h3>
          <p className="text-blue-400 font-bold">{teamsInCategory.length} / {category.maxEntries} inscritos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAdding(!isAdding)} className={`${buttonClass} bg-blue-600 hover:bg-blue-500 text-white`}>
            {isAdding ? <X size={16}/> : <UserPlus size={16} />} {isAdding ? 'Cancelar' : 'Adicionar Inscrito'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="bg-gray-900/50 p-4 rounded-md mb-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {modality === 'equipe' && (
                <div>
                  <label htmlFor={`teamName-${category.id}`} className="block text-sm font-medium text-gray-300 mb-1">Nome da Equipe</label>
                  <input type="text" id={`teamName-${category.id}`} value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playerInputs.map((_, index) => (
                  <div key={index}>
                    <label htmlFor={`player-${category.id}-${index}`} className="block text-sm font-medium text-gray-300 mb-1">{modality === 'individual' ? 'Nome do Participante' : `Jogador ${index + 1}`}</label>
                    <input type="text" id={`player-${category.id}-${index}`} value={players[index] || ''} onChange={(e) => handlePlayerChange(index, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                  </div>
                ))}
                {modality === 'equipe' && (
                  <button type="button" onClick={addPlayerField} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center gap-2 h-10 self-end">
                    <UserPlus size={16} /> Adicionar Jogador
                  </button>
                )}
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors">Confirmar Inscrição</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-h-60 overflow-y-auto pr-2">
        {teamsInCategory.length > 0 ? (
          <ul className="space-y-2">
            {teamsInCategory.map(team => (
              <li key={team.id} className="bg-gray-900/50 p-3 rounded-md flex items-center gap-3">
                {modality === 'individual' ? <User size={18} className="text-gray-400"/> : <Users size={18} className="text-gray-400"/>}
                <span className="font-semibold">{getParticipantDisplayName(team, modality)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">Nenhum inscrito nesta categoria.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
