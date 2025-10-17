import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Match } from '../types';
import BracketRound from '../components/BracketRound';
import TournamentNav from '../components/TournamentNav';
import { useTournamentNav } from '../hooks/useTournamentNav';

export const Bracket: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { selectedTournament, selectTournament, primaryTextColor, secondaryTextColor } = useData();
  const { isNavVisible, toggleNav } = useTournamentNav(true);

  useEffect(() => {
    if (tournamentId) {
      selectTournament(tournamentId);
    } else {
      navigate('/');
    }
  }, [tournamentId, selectTournament, navigate]);

  const rounds = useMemo(() => {
    if (!selectedTournament) return new Map<number, Match[]>();

    const groupedByRound = new Map<number, Match[]>();
    selectedTournament.matches.forEach(match => {
      if (!groupedByRound.has(match.round)) {
        groupedByRound.set(match.round, []);
      }
      groupedByRound.get(match.round)!.push(match);
    });
    
    return new Map([...groupedByRound.entries()].sort((a, b) => a[0] - b[0]));
  }, [selectedTournament]);

  if (!selectedTournament) {
    return (
      <div className="flex items-center justify-center h-full pt-32">
        <h2 className="text-3xl font-bold" style={{ color: primaryTextColor }}>Carregando chaveamento...</h2>
      </div>
    );
  }

  const categoriesText = selectedTournament.categories.map(c => `${c.group}/${c.level}`).join(' | ');

  return (
    <div className="p-6 pt-32 h-full flex flex-col container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow flex flex-col"
      >
        <div 
            className="w-full py-4 flex items-center justify-center text-center cursor-pointer"
            onClick={toggleNav}
            title="Clique para exibir/ocultar o menu (ou pressione 'M')"
        >
            <div>
                <h1 className="text-4xl font-black text-shadow-md" style={{ color: secondaryTextColor }}>Chaveamento do Torneio</h1>
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

        <div className="flex-grow bg-black bg-opacity-50 rounded-lg p-6 overflow-x-auto">
          <div className="flex gap-16 min-h-full">
            {Array.from(rounds.keys()).map(roundNumber => (
              <BracketRound
                key={roundNumber}
                roundNumber={roundNumber}
                matches={rounds.get(roundNumber) || []}
                modality={selectedTournament.modality}
              />
            ))}
            {rounds.size === 0 && (
                <div className="w-full flex items-center justify-center">
                    <p className="text-gray-400 text-xl">Nenhum jogo criado para este torneio ainda.</p>
                </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
