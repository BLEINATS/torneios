import React from 'react';
import { Match, TournamentModality } from '../types';
import BracketMatchup from './BracketMatchup';
import { useData } from '../context/DataContext';

interface BracketRoundProps {
  roundNumber: number;
  matches: Match[];
  modality: TournamentModality;
}

const BracketRound: React.FC<BracketRoundProps> = ({ roundNumber, matches, modality }) => {
  const { secondaryTextColor } = useData();
  return (
    <div className="flex flex-col justify-start items-center gap-8 h-full flex-shrink-0">
      <h3 
        className="text-2xl font-bold text-center mb-4 sticky top-0 bg-black bg-opacity-30 px-4 py-2 rounded-b-lg"
        style={{ color: secondaryTextColor }}
      >
        Rodada {roundNumber}
      </h3>
      {matches.map(match => (
        <BracketMatchup key={match.id} match={match} modality={modality} />
      ))}
    </div>
  );
};

export default BracketRound;
