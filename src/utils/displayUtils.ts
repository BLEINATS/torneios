import { Team, TournamentModality } from '../types';

/**
 * Retorna o nome de exibição correto para um participante com base na modalidade do torneio.
 * @param team - O objeto da equipe/participante.
 * @param modality - A modalidade do torneio ('individual', 'duplas', 'equipe').
 * @returns O nome formatado para exibição.
 */
export const getParticipantDisplayName = (team: Team, modality: TournamentModality): string => {
  if (!team) {
    return 'Participante indefinido';
  }

  switch (modality) {
    case 'individual':
      // Para individual, o nome da equipe é o nome do jogador.
      return team.name;
    case 'duplas':
      // Para duplas, junta os nomes dos jogadores.
      if (team.players && team.players.length > 0) {
        return team.players.map(p => p.name).join(' & ');
      }
      return team.name; // Fallback para o nome da equipe
    case 'equipe':
      // Para equipes, usa o nome da equipe.
      return team.name;
    default:
      return team.name;
  }
};
