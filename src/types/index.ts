export interface Player {
  id: string;
  name: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  categoryId: string;
}

export type MatchStatus = 'upcoming' | 'live' | 'finished';

export interface Match {
  id:string;
  round: number;
  court: string;
  date?: string;
  scheduledTime?: string;
  team1: {
    team: Team;
    score: number;
  };
  team2: {
    team: Team;
    score: number;
  };
  status: MatchStatus;
  categoryId: string;
}

export type TournamentModality = 'individual' | 'duplas' | 'equipe';
export type TournamentGroup = 'masculino' | 'feminino' | 'misto' | 'aberto';
export type TournamentStatus = 'planejado' | 'em-andamento' | 'finalizado';

export interface TournamentCategory {
    id: string;
    group: TournamentGroup;
    level: string; // Now a string for custom values
    prize1?: string;
    prize2?: string;
    prize3?: string;
    maxEntries: number;
    entryFee: number;
}

export interface TournamentColors {
  primary: string;
  secondary: string;
}

export interface Tournament {
    id: string;
    name: string;
    tournamentType: string;
    status: TournamentStatus;
    modality: TournamentModality;
    categories: TournamentCategory[];
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    courts: string[];
    teams: Team[];
    matches: Match[];
    backgroundImage?: string;
    logoImage?: string;
    sponsors?: Sponsor[];
    colors?: TournamentColors;
}
