import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament, TournamentCategory, Team } from '../../types';
import { useData } from '../../context/DataContext';
import { UserPlus, User, Users, X, Pencil, Trash2, Save } from 'lucide-react';
import { getParticipantDisplayName } from '../../utils/displayUtils';

interface CategoryCardProps {
  category: TournamentCategory;
  tournament: Tournament;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, tournament }) => {
  const { addTeam, updateTeam, deleteTeam } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  // State for the "add new" form
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayers, setNewPlayers] = useState<string[]>(['']);

  // State for the "edit existing" form
  const [editFormState, setEditFormState] = useState<{ teamName: string; players: { id: string; name: string }[] }>({ teamName: '', players: [] });

  const { modality, teams, id: tournamentId } = tournament;
  const teamsInCategory = useMemo(() => teams.filter(t => t.categoryId === category.id), [teams, category.id]);

  useEffect(() => {
    if (isAdding) {
      setNewTeamName('');
      setNewPlayers(modality === 'duplas' ? ['', ''] : ['']);
    }
  }, [isAdding, modality]);

  const handleStartEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditFormState({ teamName: team.name, players: [...team.players] });
    setIsAdding(false); // Close the "add" form if it's open
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
  };

  const handleSaveEdit = () => {
    if (!editingTeamId) return;
    const finalTeamName = modality === 'equipe' ? editFormState.teamName : editFormState.players.map(p => p.name).join(' & ');
    updateTeam(editingTeamId, finalTeamName, editFormState.players);
    setEditingTeamId(null);
  };

  const handleEditFormPlayerChange = (index: number, value: string) => {
    const updatedPlayers = [...editFormState.players];
    updatedPlayers[index].name = value;
    setEditFormState({ ...editFormState, players: updatedPlayers });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTeamName: string;
    const finalPlayerNames = newPlayers.map(p => p.trim()).filter(Boolean);

    if (modality === 'individual') {
        if (finalPlayerNames.length !== 1) { alert('Por favor, preencha o nome do participante.'); return; }
        finalTeamName = finalPlayerNames[0];
    } else if (modality === 'duplas') {
        if (finalPlayerNames.length !== 2) { alert('Por favor, preencha o nome dos dois jogadores.'); return; }
        finalTeamName = finalPlayerNames.join(' & ');
    } else { // equipe
        finalTeamName = newTeamName.trim();
        if (!finalTeamName) { alert('Por favor, preencha o nome da equipe.'); return; }
        if (finalPlayerNames.length === 0) { alert('A equipe deve ter pelo menos um jogador.'); return; }
    }
    
    addTeam(tournamentId, category.id, finalTeamName, finalPlayerNames);
    setIsAdding(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este participante? Esta ação não pode ser desfeita se ele já estiver em um confronto.')) {
        deleteTeam(teamId);
    }
  };

  const buttonClass = "flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const renderPlayerInputs = (playersState: string[], onChange: (index: number, value: string) => void) => {
    const count = modality === 'duplas' ? 2 : (modality === 'individual' ? 1 : playersState.length);
    return Array.from({ length: count }).map((_, index) => (
      <div key={index}>
        <label className="block text-sm font-medium text-gray-300 mb-1">{modality === 'individual' ? 'Nome do Participante' : `Jogador ${index + 1}`}</label>
        <input type="text" value={playersState[index] || ''} onChange={(e) => onChange(index, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
      </div>
    ));
  };
  
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white capitalize">{category.group} - {category.level}</h3>
          <p className="text-blue-400 font-bold">{teamsInCategory.length} / {category.maxEntries} inscritos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setIsAdding(!isAdding); setEditingTeamId(null); }} className={`${buttonClass} bg-blue-600 hover:bg-blue-500 text-white`}>
            {isAdding ? <X size={16}/> : <UserPlus size={16} />} {isAdding ? 'Cancelar' : 'Adicionar Inscrito'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            className="bg-gray-900/50 p-4 rounded-md mb-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleAddSubmit} className="space-y-4">
              {modality === 'equipe' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Equipe</label>
                  <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" required />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderPlayerInputs(newPlayers, (index, value) => {
                  const updatedPlayers = [...newPlayers];
                  updatedPlayers[index] = value;
                  setNewPlayers(updatedPlayers);
                })}
                {modality === 'equipe' && (
                  <button type="button" onClick={() => setNewPlayers([...newPlayers, ''])} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center gap-2 h-10 self-end">
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
              <li key={team.id} className="bg-gray-900/50 p-3 rounded-md flex items-center gap-3 group">
                {editingTeamId === team.id ? (
                    <div className="w-full space-y-3">
                        {modality === 'equipe' && (
                             <input type="text" value={editFormState.teamName} onChange={(e) => setEditFormState({...editFormState, teamName: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        )}
                        {editFormState.players.map((player, index) => (
                             <input key={player.id} type="text" value={player.name} onChange={(e) => handleEditFormPlayerChange(index, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        ))}
                        <div className="flex gap-2 justify-end">
                            <button onClick={handleSaveEdit} className="text-sm bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-md">Salvar</button>
                            <button onClick={handleCancelEdit} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md">Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {modality === 'individual' ? <User size={18} className="text-gray-400"/> : <Users size={18} className="text-gray-400"/>}
                        <span className="font-semibold flex-grow">{getParticipantDisplayName(team, modality)}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEdit(team)} className="p-2 text-gray-400 hover:text-brand-yellow"><Pencil size={16}/></button>
                            <button onClick={() => handleDeleteTeam(team.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </>
                )}
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
