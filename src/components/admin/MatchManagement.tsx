import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, Play, Check, Pencil, Tv2, XCircle } from 'lucide-react';
import { getParticipantDisplayName } from '../../utils/displayUtils';
import EditMatchModal from './EditMatchModal';
import { Match } from '../../types';

const MatchManagement: React.FC = () => {
  const { selectedTournament, createMatch, updateMatchScore, startMatch, finishMatch, featuredMatch, setFeaturedMatch } = useData();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [round, setRound] = useState(1);
  const [court, setCourt] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);

  if (!selectedTournament) return null;
  const { teams, matches, modality, id: tournamentId, categories, courts } = selectedTournament;

  const teamsInCategory = useMemo(() => teams.filter(t => t.categoryId === selectedCategoryId), [teams, selectedCategoryId]);
  const availableTeamsForT2 = teamsInCategory.filter(t => t.id !== team1Id);

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (team1Id && team2Id && team1Id !== team2Id && selectedCategoryId && court) {
      createMatch(tournamentId, selectedCategoryId, team1Id, team2Id, round, court, scheduledTime);
      setTeam1Id('');
      setTeam2Id('');
      setScheduledTime('');
      setCourt(courts[0] || '');
    }
  };

  const handleOpenEditModal = (match: Match) => {
    setMatchToEdit(match);
    setIsEditModalOpen(true);
  };
  
  const renderMatchList = (title: string, status: 'live' | 'upcoming' | 'finished') => {
    const filteredMatches = matches.filter(m => m.status === status);
    return (
      <div>
        <h4 className="text-xl font-bold text-brand-yellow mb-3 mt-6">{title}</h4>
        {filteredMatches.length > 0 ? (
          <div className="space-y-3">
            {filteredMatches.map(match => {
              const team1Name = getParticipantDisplayName(match.team1.team, modality);
              const team2Name = getParticipantDisplayName(match.team2.team, modality);
              const isFeatured = featuredMatch?.id === match.id;
              return (
                <div key={match.id} className="bg-gray-800 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{team1Name} vs {team2Name}</p>
                      <p className="text-sm text-gray-400">Rodada {match.round} - {match.court} {match.scheduledTime && `- ${match.scheduledTime}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === 'live' && (
                        <>
                          <button onClick={() => updateMatchScore(tournamentId, match.id, 'team1')} className="bg-green-500 p-1 rounded-full"><Plus size={16}/></button>
                          <span className="font-mono text-lg">{match.team1.score} x {match.team2.score}</span>
                          <button onClick={() => updateMatchScore(tournamentId, match.id, 'team2')} className="bg-green-500 p-1 rounded-full"><Plus size={16}/></button>
                          <button onClick={() => finishMatch(tournamentId, match.id)} className="bg-red-500 p-2 rounded-md"><Check size={16} /></button>
                        </>
                      )}
                      {status === 'upcoming' && (
                        <button onClick={() => startMatch(tournamentId, match.id)} className="bg-blue-500 p-2 rounded-md"><Play size={16} /></button>
                      )}
                      {status === 'finished' && (
                         <span className="font-mono text-lg">{match.team1.score} x {match.team2.score}</span>
                      )}
                       <button 
                          onClick={() => setFeaturedMatch(isFeatured ? null : match.id)}
                          className={`p-2 rounded-md transition-colors ${isFeatured ? 'bg-purple-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                          title={isFeatured ? "Remover do Telão" : "Enviar para o Telão"}
                        >
                          <Tv2 size={16} />
                        </button>
                       <button onClick={() => handleOpenEditModal(match)} className="bg-gray-600 p-2 rounded-md"><Pencil size={16} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">Nenhuma partida nesta categoria.</p>}
      </div>
    );
  };

  return (
    <>
      <EditMatchModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        match={matchToEdit}
        tournament={selectedTournament}
      />
      <div>
        <h3 className="text-2xl font-bold text-brand-yellow mb-4">Criar Nova Partida (Manual)</h3>
        <form onSubmit={handleCreateMatch} className="space-y-4 mb-8">
          <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
              <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                  <option value="">Selecione a categoria</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id} className="capitalize">{cat.group} / {cat.level}</option>)}
              </select>
          </div>
          {selectedCategoryId && (
              <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">{modality === 'individual' ? 'Participante 1' : 'Equipe 1'}</label>
                          <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                              <option value="">Selecione</option>
                              {teamsInCategory.map(t => <option key={t.id} value={t.id}>{getParticipantDisplayName(t, modality)}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">{modality === 'individual' ? 'Participante 2' : 'Equipe 2'}</label>
                          <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                              <option value="">Selecione</option>
                              {availableTeamsForT2.map(t => <option key={t.id} value={t.id}>{getParticipantDisplayName(t, modality)}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Rodada</label>
                          <input type="number" value={round} onChange={e => setRound(Number(e.target.value))} min="1" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Quadra</label>
                          <select value={court} onChange={e => setCourt(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                            <option value="">Selecione a quadra</option>
                            {courts.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Horário</label>
                          <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                      </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-yellow text-gray-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                  <Plus size={20} /> Criar Partida
                  </button>
              </>
          )}
        </form>
        
        {featuredMatch && (
            <div className="mb-6 p-4 bg-purple-900/50 rounded-lg flex justify-between items-center border border-purple-700">
                <div>
                    <p className="font-bold text-lg text-purple-300">Destaque no Telão Ativo</p>
                    <p className="text-sm text-gray-300">O jogo selecionado está sendo exibido na tela principal.</p>
                </div>
                <button onClick={() => setFeaturedMatch(null)} className="flex items-center gap-2 text-sm bg-red-600 px-3 py-2 rounded-md font-semibold hover:bg-red-500">
                    <XCircle size={16} /> Limpar Destaque
                </button>
            </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto pr-2">
          {renderMatchList('Partida Ao Vivo', 'live')}
          {renderMatchList('Próximas Partidas', 'upcoming')}
          {renderMatchList('Partidas Finalizadas', 'finished')}
        </div>
      </div>
    </>
  );
};

export default MatchManagement;
