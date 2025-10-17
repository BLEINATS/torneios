import React from 'react';
import { motion } from 'framer-motion';
import { Match, TournamentModality } from '../types';
import { getParticipantDisplayName } from '../utils/displayUtils';
import { Tv2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface UpcomingMatchCardProps {
  match: Match;
  index: number;
  modality: TournamentModality;
  onCardClick?: (match: Match) => void;
  isFeatured: boolean;
  onToggleFeature: (matchId: string) => void;
}

const UpcomingMatchCard: React.FC<UpcomingMatchCardProps> = ({ match, index, modality, onCardClick, isFeatured, onToggleFeature }) => {
  const { secondaryTextColor } = useData();
  const team1Name = getParticipantDisplayName(match.team1.team, modality);
  const team2Name = getParticipantDisplayName(match.team2.team, modality);
  const isClickable = !!onCardClick;

  const handleFeatureClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from firing
    onToggleFeature(match.id);
  };

  return (
    <motion.div
      onClick={() => isClickable && onCardClick(match)}
      className={`bg-black bg-opacity-50 rounded-lg p-4 w-full border-2 border-transparent ${isClickable ? 'cursor-pointer hover:bg-opacity-70 hover:border-brand-yellow transition-all' : ''}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-grow">
          <p className="text-sm font-bold mb-2" style={{ color: secondaryTextColor }}>{match.court} {match.scheduledTime && match.scheduledTime !== '00:00' && `- ${match.scheduledTime}`}</p>
          <div className="flex justify-between items-center">
            <div className="text-base font-semibold text-left">
              <p>{team1Name}</p>
            </div>
            <span className="text-gray-400 mx-2">vs</span>
            <div className="text-base font-semibold text-right">
              <p>{team2Name}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleFeatureClick}
          className={`p-2 rounded-md transition-colors flex-shrink-0 ${isFeatured ? 'bg-purple-500 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
          title={isFeatured ? "Remover dos Destaques" : "Adicionar aos Destaques"}
        >
          <Tv2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default UpcomingMatchCard;
