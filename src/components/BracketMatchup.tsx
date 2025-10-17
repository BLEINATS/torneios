import React from 'react';
import { Match, TournamentModality } from '../types';
import { Trophy } from 'lucide-react';
import { getParticipantDisplayName } from '../utils/displayUtils';
import { useData } from '../context/DataContext';

interface BracketMatchupProps {
  match: Match;
  modality: TournamentModality;
}

const TeamLine: React.FC<{ team: Match['team1']['team'], score: number, isWinner: boolean, isFinished: boolean, modality: TournamentModality, color: string }> = ({ team, score, isWinner, isFinished, modality, color }) => (
  <div className={`flex justify-between items-center p-3 transition-colors ${isWinner ? 'font-bold' : 'text-gray-400'}`} style={{ color: isWinner ? color : '' }}>
    <div className="flex items-center gap-2">
      {isWinner && <Trophy size={16} className="text-yellow-400" />}
      <span>{getParticipantDisplayName(team, modality)}</span>
    </div>
    {isFinished && (
      <span className={`px-2 py-1 text-sm rounded font-mono ${isWinner ? 'bg-green-600 text-white' : 'bg-gray-600'}`}>
        {score}
      </span>
    )}
  </div>
);

const BracketMatchup: React.FC<BracketMatchupProps> = ({ match, modality }) => {
  const { primaryTextColor } = useData();
  const isFinished = match.status === 'finished';
  const winner = isFinished ? (match.team1.score > match.team2.score ? match.team1 : match.team2) : null;

  return (
    <div className="bg-gray-800 rounded-lg w-64 shadow-lg border border-gray-700">
      <TeamLine 
        team={match.team1.team} 
        score={match.team1.score} 
        isWinner={winner?.team.id === match.team1.team.id}
        isFinished={isFinished}
        modality={modality}
        color={primaryTextColor}
      />
      <div className="border-t border-gray-700/50 mx-3"></div>
      <TeamLine 
        team={match.team2.team} 
        score={match.team2.score} 
        isWinner={winner?.team.id === match.team2.team.id}
        isFinished={isFinished}
        modality={modality}
        color={primaryTextColor}
      />
       {(match.court || (match.scheduledTime && match.scheduledTime !== '00:00')) && (
        <>
          <div className="border-t border-gray-700/50"></div>
          <div className="text-xs text-gray-400 text-center py-1 px-2">
            {match.court} {match.scheduledTime && match.scheduledTime !== '00:00' && ` - ${match.scheduledTime}`}
          </div>
        </>
      )}
    </div>
  );
};

export default BracketMatchup;
