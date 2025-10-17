import React from 'react';
import { motion } from 'framer-motion';
import { Match, TournamentModality } from '../types';
import { getParticipantDisplayName } from '../utils/displayUtils';
import { useData } from '../context/DataContext';

interface CurrentMatchProps {
    match: Match;
    modality: TournamentModality;
}

const TeamDisplay: React.FC<{ team: Match['team1']; alignment: 'left' | 'right', modality: TournamentModality, color: string }> = ({ team, alignment, modality, color }) => {
    const displayName = getParticipantDisplayName(team.team, modality);

    const names = modality === 'duplas' 
        ? displayName.split(' & ') 
        : [displayName];

    return (
        <div className={`flex flex-col ${alignment === 'left' ? 'items-start' : 'items-end'}`}>
            <h2 
              className={`text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wide text-shadow-lg ${alignment === 'left' ? 'text-left' : 'text-right'}`}
              style={{ color: color }}
            >
                {names.map((name, index) => <span key={index} className="block">{name}</span>)}
            </h2>
        </div>
    );
};

const CurrentMatch: React.FC<CurrentMatchProps> = ({ match, modality }) => {
  const { primaryTextColor, secondaryTextColor } = useData();
  return (
    <motion.div 
      className="w-full flex flex-col items-center justify-center gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full max-w-6xl gap-4 md:gap-8">
        <TeamDisplay team={match.team1} alignment="right" modality={modality} color={primaryTextColor} />
        <span className="text-5xl md:text-7xl font-light text-gray-300 text-shadow-md">vs</span>
        <TeamDisplay team={match.team2} alignment="left" modality={modality} color={primaryTextColor} />
      </div>
      <div className="bg-black bg-opacity-50 py-2 px-6 rounded-lg">
        <p 
          className="text-5xl md:text-6xl font-black text-center tracking-wider text-shadow"
          style={{ color: secondaryTextColor }}
        >
          Rodada {match.round} - {match.court} {match.scheduledTime && match.scheduledTime !== '00:00' && `- ${match.scheduledTime}`}
        </p>
      </div>
    </motion.div>
  );
};

export default CurrentMatch;
