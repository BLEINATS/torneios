import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import TournamentNav from '../components/TournamentNav';
import { getParticipantDisplayName } from '../utils/displayUtils';
import { useTournamentNav } from '../hooks/useTournamentNav';

const Results: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { selectedTournament, selectTournament, finishedMatches, primaryTextColor, secondaryTextColor } = useData();
  const { isNavVisible, toggleNav } = useTournamentNav(true);

  useEffect(() => {
    if (tournamentId) {
      selectTournament(tournamentId);
    } else {
      navigate('/');
    }
  }, [tournamentId, selectTournament, navigate]);

  if (!selectedTournament) {
    return (
        <div className="flex items-center justify-center h-full pt-32">
            <h2 className="text-3xl font-bold" style={{ color: primaryTextColor }}>Carregando resultados...</h2>
        </div>
    )
  }

  const categoriesText = selectedTournament.categories.map(c => `${c.group}/${c.level}`).join(' | ');

  return (
    <div className="p-6 pt-32 h-full container mx-auto flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col flex-grow"
      >
        <div 
            className="w-full py-4 flex items-center justify-center text-center cursor-pointer"
            onClick={toggleNav}
            title="Clique para exibir/ocultar o menu (ou pressione 'M')"
        >
            <div>
                <h1 className="text-4xl font-black text-shadow-md" style={{ color: secondaryTextColor }}>Resultados Finais</h1>
                <p className="text-lg text-shadow capitalize" style={{ color: primaryTextColor }}>{selectedTournament.name} - {categoriesText}</p>
            </div>
        </div>
        <AnimatePresence>
            {isNavVisible && (
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
            >
                <TournamentNav />
            </motion.div>
            )}
        </AnimatePresence>
        
        <div className="bg-black bg-opacity-50 rounded-lg overflow-hidden flex-grow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black bg-opacity-50 uppercase">
                <tr>
                  <th className="p-4" style={{ color: secondaryTextColor }}>Rodada</th>
                  <th className="p-4" style={{ color: secondaryTextColor }}>Quadra</th>
                  <th className="p-4" style={{ color: secondaryTextColor }}>Horário</th>
                  <th className="p-4" style={{ color: secondaryTextColor }}>Vencedor(a)</th>
                  <th className="p-4" style={{ color: secondaryTextColor }}>Perdedor(a)</th>
                  <th className="p-4 text-right" style={{ color: secondaryTextColor }}>Placar</th>
                </tr>
              </thead>
              <tbody>
                {finishedMatches.length > 0 ? (
                  finishedMatches.sort((a,b) => a.round - b.round).map((match, index) => {
                    const winner = match.team1.score > match.team2.score ? match.team1 : match.team2;
                    const loser = match.team1.score < match.team2.score ? match.team1 : match.team2;
                    const winnerName = getParticipantDisplayName(winner.team, selectedTournament.modality);
                    const loserName = getParticipantDisplayName(loser.team, selectedTournament.modality);

                    return (
                      <motion.tr 
                        key={match.id} 
                        className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="p-4">{match.round}</td>
                        <td className="p-4">{match.court}</td>
                        <td className="p-4">{(match.scheduledTime && match.scheduledTime !== '00:00') ? match.scheduledTime : '-'}</td>
                        <td className="p-4 font-bold">{winnerName}</td>
                        <td className="p-4 text-gray-400">{loserName}</td>
                        <td className="p-4 text-right font-mono">{`${winner.score} x ${loser.score}`}</td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-400">Nenhum resultado finalizado ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Results;
