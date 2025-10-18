import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { TournamentCategory } from '../../types';
import { getParticipantDisplayName } from '../../utils/displayUtils';
import { Zap, Trash2, Plus, ArrowRight, X } from 'lucide-react';

const BracketingManagement: React.FC = () => {
    const { selectedTournament, generateAutomaticBracket, resetBracket, createMatch, secondaryTextColor } = useData();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selection1, setSelection1] = useState<string | null>(null);
    const [selection2, setSelection2] = useState<string | null>(null);

    const selectedCategory: TournamentCategory | undefined = useMemo(() => 
        selectedTournament?.categories.find(c => c.id === selectedCategoryId),
        [selectedTournament, selectedCategoryId]
    );

    const availableTeamsForDraw = useMemo(() => {
        if (!selectedTournament || !selectedCategoryId) return [];
        
        const teamsInCategory = selectedTournament.teams.filter(t => t.categoryId === selectedCategoryId);
        const teamsInUpcomingMatches = new Set<string>();

        selectedTournament.matches
            .filter(m => m.status === 'upcoming' && m.categoryId === selectedCategoryId)
            .forEach(match => {
                teamsInUpcomingMatches.add(match.team1.team.id);
                teamsInUpcomingMatches.add(match.team2.team.id);
            });

        return teamsInCategory.filter(team => !teamsInUpcomingMatches.has(team.id));
    }, [selectedTournament, selectedCategoryId]);

    if (!selectedTournament) {
        return <p>Carregando...</p>;
    }

    const { id: tournamentId, modality } = selectedTournament;

    const handleGenerate = () => {
        if (window.confirm(`Isso irá apagar TODO o chaveamento existente (incluindo resultados) e gerar uma nova Rodada 1 para esta categoria. Deseja continuar?`)) {
            generateAutomaticBracket(tournamentId, selectedCategoryId);
        }
    };

    const handleReset = () => {
        if (window.confirm(`Tem certeza que deseja resetar o chaveamento desta categoria? TODOS os jogos, incluindo resultados finalizados, serão apagados. Esta ação não pode ser desfeita.`)) {
            resetBracket(tournamentId, selectedCategoryId);
        }
    };
    
    const handleSelectParticipant = (teamId: string) => {
        if (selection1 === teamId || selection2 === teamId) return; // Cannot select the same team

        if (!selection1) {
            setSelection1(teamId);
        } else if (!selection2) {
            setSelection2(teamId);
        }
    };

    const handleCreateMatch = () => {
        if (selection1 && selection2 && selectedCategory) {
            createMatch(tournamentId, selectedCategory.id, selection1, selection2, 1, '', '');
            setSelection1(null);
            setSelection2(null);
        }
    };

    const team1 = selectedTournament.teams.find(t => t.id === selection1);
    const team2 = selectedTournament.teams.find(t => t.id === selection2);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Selecione uma Categoria para Gerenciar</label>
                <select
                    value={selectedCategoryId}
                    onChange={e => {
                        setSelectedCategoryId(e.target.value);
                        setSelection1(null);
                        setSelection2(null);
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                >
                    <option value="">-- Selecione --</option>
                    {selectedTournament.categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="capitalize">{cat.group} / {cat.level}</option>
                    ))}
                </select>
            </div>

            {selectedCategoryId && selectedCategory && (
                <>
                    {/* Automatic Generation */}
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-white mb-3">Chaveamento Automático</h4>
                        <p className="text-sm text-gray-400 mb-4">Gera todos os confrontos da primeira rodada de uma vez, embaralhando os participantes.</p>
                        <div className="flex gap-4">
                            <button onClick={handleGenerate} disabled={availableTeamsForDraw.length < 2} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors bg-gray-600 hover:bg-gray-500 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                <Zap size={16} /> Gerar Chaves
                            </button>
                            <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors bg-red-800 hover:bg-red-700 text-white">
                                <Trash2 size={16} /> Resetar Chaveamento
                            </button>
                        </div>
                    </div>

                    {/* Manual Draw */}
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-lg font-bold text-white mb-3">Sorteio Manual</h4>
                        <p className="text-sm text-gray-400 mb-4">Crie confrontos manualmente selecionando dois participantes do pool de sorteio.</p>
                        
                        {/* Current Matchup */}
                        <div className="bg-gray-800 p-4 rounded-lg mb-4 flex items-center justify-around gap-4 h-24">
                            <div className="flex-1 text-center font-bold text-lg">
                                {team1 ? getParticipantDisplayName(team1, modality) : <span className="text-gray-500">Participante 1</span>}
                            </div>
                            <ArrowRight size={24} style={{ color: secondaryTextColor }} className="flex-shrink-0" />
                             <div className="flex-1 text-center font-bold text-lg">
                                {team2 ? getParticipantDisplayName(team2, modality) : <span className="text-gray-500">Participante 2</span>}
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <button onClick={handleCreateMatch} disabled={!selection1 || !selection2} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                                <Plus size={16} /> Criar Confronto
                            </button>
                             <button onClick={() => { setSelection1(null); setSelection2(null); }} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-colors bg-gray-600 hover:bg-gray-500 text-white">
                                <X size={16} /> Limpar Seleção
                            </button>
                        </div>

                        {/* Draw Pool */}
                        <div>
                            <h5 className="font-semibold mb-2" style={{ color: secondaryTextColor }}>Pool de Sorteio ({availableTeamsForDraw.length} disponíveis)</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-2">
                                {availableTeamsForDraw.map(team => {
                                    const isSelected = team.id === selection1 || team.id === selection2;
                                    return (
                                        <button
                                            key={team.id}
                                            onClick={() => handleSelectParticipant(team.id)}
                                            disabled={isSelected}
                                            className={`p-3 rounded-md text-sm font-semibold text-left transition-colors ${
                                                isSelected
                                                    ? 'bg-brand-yellow text-gray-900 cursor-not-allowed'
                                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                            }`}
                                        >
                                            {getParticipantDisplayName(team, modality)}
                                        </button>
                                    );
                                })}
                                {availableTeamsForDraw.length === 0 && (
                                    <p className="col-span-full text-center text-gray-500 py-4">Nenhum participante disponível para sorteio.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BracketingManagement;
