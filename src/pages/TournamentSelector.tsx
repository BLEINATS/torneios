import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Trophy, Users, User, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';

const ModalityIcon = ({ modality, color }: { modality: string, color: string }) => {
  switch (modality) {
    case 'individual': return <User style={{ color }} size={20} />;
    case 'duplas': return <Users style={{ color }} size={20} />;
    case 'equipe': return <Trophy style={{ color }} size={20} />;
    default: return null;
  }
};

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'planejado': return <Calendar className="text-blue-400" size={16}/>;
      case 'em-andamento': return <Clock className="text-green-400" size={16}/>;
      case 'finalizado': return <CheckCircle className="text-gray-400" size={16}/>;
      default: return null;
    }
  };

const TournamentSelector: React.FC = () => {
  const { tournaments, deleteTournament, primaryTextColor, secondaryTextColor } = useData();

  const handleDelete = (e: React.MouseEvent, tournamentId: string, tournamentName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o torneio "${tournamentName}"? Esta ação não pode ser desfeita.`)) {
      deleteTournament(tournamentId);
    }
  };

  return (
    <div className="p-6 pt-32 h-full container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-5xl font-black text-center text-shadow-lg mb-12" style={{ color: primaryTextColor }}>Selecione um Torneio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link 
                to={`/tournament/${tournament.id}`}
                className="block relative bg-black bg-opacity-50 rounded-lg p-6 hover:bg-opacity-70 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-brand-yellow h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-3xl font-black pr-8" style={{ color: tournament.colors?.secondary || secondaryTextColor }}>{tournament.name}</h3>
                    <ModalityIcon modality={tournament.modality} color={tournament.colors?.secondary || secondaryTextColor} />
                  </div>
                  <div className="space-y-3 text-white text-base">
                      <p className="flex items-center gap-2 capitalize"><StatusIcon status={tournament.status} /> {tournament.status.replace('-', ' ')}</p>
                      <p>Inscritos: {tournament.teams.length}</p>
                      <p>Data: {new Date(tournament.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, tournament.id, tournament.name)}
                  className="absolute bottom-6 right-6 z-10 p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors transform hover:scale-110"
                  title="Excluir Torneio"
                >
                  <Trash2 size={20} />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TournamentSelector;
