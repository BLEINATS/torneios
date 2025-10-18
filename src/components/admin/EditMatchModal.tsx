import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, Tournament } from '../../types';
import { useData } from '../../context/DataContext';
import { X, Save, CheckCircle, RotateCcw } from 'lucide-react';
import { getParticipantDisplayName } from '../../utils/displayUtils';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  tournament: Tournament | null;
}

const EditMatchModal: React.FC<EditMatchModalProps> = ({ isOpen, onClose, match, tournament }) => {
  const { updateMatchDetails, finishMatch, resetMatch } = useData();
  const [court, setCourt] = useState('');
  const [date, setDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  useEffect(() => {
    if (match && tournament) {
      setCourt(match.court);
      setDate(match.date || tournament.startDate || '');
      setScheduledTime(match.scheduledTime || '');
      setScore1(match.team1.score);
      setScore2(match.team2.score);
    }
  }, [match, tournament]);

  const handleSaveChanges = () => {
    if (match && tournament) {
      updateMatchDetails(tournament.id, match.id, {
        court,
        date,
        scheduledTime,
        score1: Number(score1),
        score2: Number(score2),
      });
      onClose();
    }
  };

  const handleFinishMatch = () => {
    if (match && tournament) {
      finishMatch(tournament.id, match.id, Number(score1), Number(score2));
      onClose();
    }
  };

  const handleResetMatch = () => {
    if (match && tournament) {
        if (window.confirm('Tem certeza que deseja resetar esta partida? O placar será zerado e ela voltará para a lista de "Próximos Jogos". Se esta partida gerou um confronto futuro, ele será apagado.')) {
            resetMatch(tournament.id, match.id);
            onClose();
        }
    }
  };

  if (!tournament || !match) return null;

  const team1Name = getParticipantDisplayName(match.team1.team, tournament.modality);
  const team2Name = getParticipantDisplayName(match.team2.team, tournament.modality);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-brand-yellow">Editar Partida</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 items-center">
                    <p className="text-right font-semibold">{team1Name}</p>
                    <p className="text-left font-semibold">{team2Name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <input
                    type="number"
                    value={score1}
                    onChange={e => setScore1(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-center text-lg font-bold"
                  />
                  <input
                    type="number"
                    value={score2}
                    onChange={e => setScore2(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-center text-lg font-bold"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Quadra</label>
                        <select value={court} onChange={e => setCourt(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                            <option value="">Selecione a quadra</option>
                            {tournament.courts.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Horário</label>
                        <input
                            type="time"
                            value={scheduledTime}
                            onChange={e => setScheduledTime(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Deixe em 00:00 para ocultar o horário.</p>
                    </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700 flex justify-between items-center">
                {match.status === 'finished' && (
                    <button
                        type="button"
                        onClick={handleResetMatch}
                        className="bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} /> Resetar Partida
                    </button>
                )}
                <div className="flex justify-end gap-3 flex-grow">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> Salvar Alterações
                  </button>
                  {match.status !== 'finished' && (
                      <button
                          type="button"
                          onClick={handleFinishMatch}
                          className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                      >
                          <CheckCircle size={18} /> Finalizar Partida
                      </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditMatchModal;
