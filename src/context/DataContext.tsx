import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Team, Match, Player, Tournament, TournamentCategory, Sponsor, TournamentColors } from '../types';
import { supabase } from '../lib/supabaseClient';
import { faker } from '@faker-js/faker';

const DEFAULT_BG = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2807&auto=format&fit=crop";
const DEFAULT_LOGO = "https://i.ibb.co/L8yT7gM/match-point-sports-logo.png";
const DEFAULT_PRIMARY_COLOR = '#FFFFFF';
const DEFAULT_SECONDARY_COLOR = '#FFD700';

interface DataContextType {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  liveMatch: Match | undefined;
  upcomingMatches: Match[];
  finishedMatches: Match[];
  featuredMatches: Match[];
  backgroundImage: string;
  logoImage: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  isLoading: boolean;
  updateTournamentBranding: (tournamentId: string, urls: { bg?: string; logo?: string }) => Promise<void>;
  updateTournamentColors: (tournamentId: string, colors: TournamentColors) => Promise<void>;
  toggleFeaturedMatch: (matchId: string) => void;
  clearFeaturedMatches: () => void;
  selectTournament: (tournamentId: string | null) => void;
  addTournament: (data: Omit<Tournament, 'id' | 'teams' | 'matches' | 'backgroundImage' | 'logoImage' | 'sponsors' | 'colors'>) => Promise<void>;
  updateTournament: (tournamentId: string, data: Partial<Omit<Tournament, 'id' | 'categories' | 'teams' | 'matches' | 'sponsors' | 'colors'>>, categories: Partial<TournamentCategory>[]) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  addTeam: (tournamentId: string, categoryId: string, teamName: string, players: string[]) => Promise<void>;
  addSponsor: (tournamentId: string, name: string, logo: string) => Promise<void>;
  deleteSponsor: (tournamentId: string, sponsorId: string) => Promise<void>;
  createMatch: (tournamentId: string, categoryId: string, team1Id: string, team2Id: string, round: number, court: string, scheduledTime: string) => Promise<void>;
  updateMatchDetails: (tournamentId: string, matchId: string, details: { court?: string; date?: string; scheduledTime?: string; score1?: number; score2?: number }) => Promise<void>;
  updateMatchScore: (tournamentId: string, matchId: string, team: 'team1' | 'team2') => Promise<void>;
  startMatch: (tournamentId: string, matchId: string) => Promise<void>;
  finishMatch: (tournamentId: string, matchId: string, score1?: number, score2?: number) => Promise<void>;
  generateAutomaticBracket: (tournamentId: string, categoryId: string) => Promise<void>;
  clearUpcomingMatches: (tournamentId: string, categoryId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [featuredMatchIds, setFeaturedMatchIds] = useState<string[]>([]);
  const [backgroundImage, setBackgroundImage] = useState(DEFAULT_BG);
  const [logoImage, setLogoImage] = useState(DEFAULT_LOGO);
  const [primaryTextColor, setPrimaryTextColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryTextColor, setSecondaryTextColor] = useState(DEFAULT_SECONDARY_COLOR);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const { data: tournamentsData, error: tournamentsError } = await supabase.from('tournaments').select('*');
    const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*');
    const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
    const { data: playersData, error: playersError } = await supabase.from('players').select('*');
    const { data: matchesData, error: matchesError } = await supabase.from('matches').select('*');
    const { data: sponsorsData, error: sponsorsError } = await supabase.from('sponsors').select('*');

    if (tournamentsError || categoriesError || teamsError || playersError || matchesError || sponsorsError) {
      console.error("Error fetching data:", { tournamentsError, categoriesError, teamsError, playersError, matchesError, sponsorsError });
      setIsLoading(false);
      return;
    }

    const teamsMap = new Map<string, Team>();
    teamsData.forEach(team => {
      const teamPlayers = playersData
        .filter(p => p.team_id === team.id)
        .map(p => ({ id: p.id, name: p.name }));
      
      teamsMap.set(team.id, {
        id: team.id,
        name: team.name,
        players: teamPlayers,
        categoryId: team.category_id,
      });
    });

    const assembledTournaments: Tournament[] = tournamentsData.map(tourney => {
      const tournamentTeams = Array.from(teamsMap.values()).filter(t => {
        const teamData = teamsData.find(td => td.id === t.id);
        return teamData?.tournament_id === tourney.id;
      });

      const tournamentMatches: Match[] = matchesData
        .filter(m => m.tournament_id === tourney.id)
        .map(match => {
          const team1 = teamsMap.get(match.team1_id);
          const team2 = teamsMap.get(match.team2_id);
          if (!team1 || !team2) return null;
          return {
            id: match.id, round: match.round, court: match.court, date: match.date,
            scheduledTime: match.scheduledTime, status: match.status, categoryId: match.category_id,
            team1: { team: team1, score: match.team1_score },
            team2: { team: team2, score: match.team2_score },
          };
        }).filter((m): m is Match => m !== null);
      
      const tournamentCategories: TournamentCategory[] = categoriesData
        .filter(c => c.tournament_id === tourney.id)
        .map(c => ({
          id: c.id, group: c.group, level: c.level, prize1: c.prize1, prize2: c.prize2,
          prize3: c.prize3, maxEntries: c.max_entries, entryFee: c.entry_fee,
        }));

      const tournamentSponsors: Sponsor[] = sponsorsData
        .filter(s => s.tournament_id === tourney.id)
        .map(s => ({ id: s.id, name: s.name, logo: s.logo }));

      return {
        id: tourney.id, name: tourney.name, tournamentType: tourney.tournamentType, status: tourney.status,
        modality: tourney.modality, startDate: tourney.startDate, endDate: tourney.endDate,
        startTime: tourney.startTime, endTime: tourney.endTime, courts: tourney.courts,
        backgroundImage: tourney.backgroundImage, logoImage: tourney.logoImage, colors: tourney.colors,
        categories: tournamentCategories, teams: tournamentTeams, matches: tournamentMatches, sponsors: tournamentSponsors,
      };
    });

    setTournaments(assembledTournaments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectTournament = useCallback((tournamentId: string | null) => {
    if (tournamentId !== selectedTournamentId) {
      setSelectedTournamentId(tournamentId);
      // Resetting featured matches when tournament changes
      setFeaturedMatchIds([]);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    const foundTournament = tournaments.find(t => t.id === selectedTournamentId);
    if (foundTournament) {
      setBackgroundImage(foundTournament.backgroundImage || DEFAULT_BG);
      setLogoImage(foundTournament.logoImage || DEFAULT_LOGO);
      setPrimaryTextColor(foundTournament.colors?.primary || DEFAULT_PRIMARY_COLOR);
      setSecondaryTextColor(foundTournament.colors?.secondary || DEFAULT_SECONDARY_COLOR);
    } else {
      setBackgroundImage(DEFAULT_BG);
      setLogoImage(DEFAULT_LOGO);
      setPrimaryTextColor(DEFAULT_PRIMARY_COLOR);
      setSecondaryTextColor(DEFAULT_SECONDARY_COLOR);
    }
  }, [selectedTournamentId, tournaments]);

  const updateTournamentBranding = useCallback(async (tournamentId: string, urls: { bg?: string; logo?: string }) => {
    const { error } = await supabase.from('tournaments').update({ backgroundImage: urls.bg, logoImage: urls.logo }).eq('id', tournamentId);
    if (error) console.error("Error updating branding:", error);
    await fetchData();
  }, [fetchData]);

  const updateTournamentColors = useCallback(async (tournamentId: string, colors: TournamentColors) => {
    const { error } = await supabase.from('tournaments').update({ colors }).eq('id', tournamentId);
    if (error) console.error("Error updating colors:", error);
    await fetchData();
  }, [fetchData]);

  const toggleFeaturedMatch = useCallback((matchId: string) => {
    setFeaturedMatchIds(prev => prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]);
  }, []);

  const clearFeaturedMatches = useCallback(() => setFeaturedMatchIds([]), []);

  const addTournament = useCallback(async (data: Omit<Tournament, 'id' | 'teams' | 'matches' | 'backgroundImage' | 'logoImage' | 'sponsors' | 'colors'>) => {
    const { data: newTournamentData, error: tournamentError } = await supabase
      .from('tournaments').insert({
        name: data.name, tournamentType: data.tournamentType, status: data.status, modality: data.modality,
        startDate: data.startDate, endDate: data.endDate, startTime: data.startTime, endTime: data.endTime, courts: data.courts,
        backgroundImage: DEFAULT_BG, logoImage: DEFAULT_LOGO, colors: { primary: DEFAULT_PRIMARY_COLOR, secondary: DEFAULT_SECONDARY_COLOR }
      }).select().single();
    if (tournamentError) { console.error('Error adding tournament:', tournamentError); return; }

    const categoriesToInsert = data.categories.map(cat => ({
      tournament_id: newTournamentData.id,
      group: cat.group,
      level: cat.level,
      prize1: cat.prize1,
      prize2: cat.prize2,
      prize3: cat.prize3,
      max_entries: cat.maxEntries,
      entry_fee: cat.entryFee,
    }));
    const { error: categoriesError } = await supabase.from('categories').insert(categoriesToInsert);
    if (categoriesError) { console.error('Error adding categories:', categoriesError); return; }
    await fetchData();
  }, [fetchData]);

  const updateTournament = useCallback(async (
    tournamentId: string, 
    data: Partial<Omit<Tournament, 'id' | 'categories' | 'teams' | 'matches' | 'sponsors' | 'colors'>>,
    categoriesToUpdate: Partial<TournamentCategory>[]
) => {
    // 1. Update the main tournament data
    const { error: tournamentError } = await supabase.from('tournaments').update(data).eq('id', tournamentId);
    if (tournamentError) { console.error('Error updating tournament:', tournamentError); return; }

    // 2. Upsert categories (add new ones, update existing ones)
    const categoriesToUpsert = categoriesToUpdate.map(cat => ({
        id: cat.id || faker.string.uuid(),
        tournament_id: tournamentId,
        group: cat.group, level: cat.level, prize1: cat.prize1, prize2: cat.prize2, prize3: cat.prize3,
        max_entries: cat.maxEntries, entry_fee: cat.entryFee,
    }));
    const { error: upsertError } = await supabase.from('categories').upsert(categoriesToUpsert, { onConflict: 'id' });
    if (upsertError) { console.error('Error upserting categories:', upsertError); alert(`Erro ao salvar categorias: ${upsertError.message}`); }

    // 3. Fetch original categories to determine which ones to delete
    const { data: originalCategories, error: fetchCatError } = await supabase.from('categories').select('id').eq('tournament_id', tournamentId);
    if (fetchCatError) { console.error('Could not fetch original categories for deletion check'); }
    else {
        const submittedCategoryIds = new Set(categoriesToUpdate.map(c => c.id).filter(Boolean));
        const categoriesToDelete = originalCategories.filter(c => !submittedCategoryIds.has(c.id)).map(c => c.id);
        
        if (categoriesToDelete.length > 0) {
            const { error: deleteError } = await supabase.from('categories').delete().in('id', categoriesToDelete);
            if (deleteError) { console.error('Error deleting categories:', deleteError); alert('Erro ao excluir categoria(s) removida(s). Verifique se não há equipes inscritas nelas antes de excluir.'); }
        }
    }
    
    await fetchData();
}, [fetchData]);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', tournamentId);
    if (error) console.error('Error deleting tournament:', error);
    await fetchData();
  }, [fetchData]);

  const addTeam = useCallback(async (tournamentId: string, categoryId: string, teamName: string, playerNames: string[]) => {
    const { data: newTeam, error: teamError } = await supabase.from('teams').insert({
      tournament_id: tournamentId, category_id: categoryId, name: teamName
    }).select().single();
    if (teamError) { console.error('Error adding team:', teamError); return; }

    const playersToInsert = playerNames.map(name => ({ team_id: newTeam.id, name }));
    const { error: playerError } = await supabase.from('players').insert(playersToInsert);
    if (playerError) console.error('Error adding players:', playerError);
    await fetchData();
  }, [fetchData]);

  const addSponsor = useCallback(async (tournamentId: string, name: string, logo: string) => {
    const { error } = await supabase.from('sponsors').insert({ tournament_id: tournamentId, name, logo });
    if (error) console.error('Error adding sponsor:', error);
    await fetchData();
  }, [fetchData]);

  const deleteSponsor = useCallback(async (tournamentId: string, sponsorId: string) => {
    const { error } = await supabase.from('sponsors').delete().eq('id', sponsorId);
    if (error) console.error('Error deleting sponsor:', error);
    await fetchData();
  }, [fetchData]);

  const createMatch = useCallback(async (tournamentId: string, categoryId: string, team1Id: string, team2Id: string, round: number, court: string, scheduledTime: string) => {
    const { error } = await supabase.from('matches').insert({
      tournament_id: tournamentId, category_id: categoryId, team1_id: team1Id, team2_id: team2Id, round, court, scheduledTime,
      status: 'upcoming', team1_score: 0, team2_score: 0
    });
    if (error) console.error('Error creating match:', error);
    await fetchData();
  }, [fetchData]);

  const updateMatchDetails = useCallback(async (tournamentId: string, matchId: string, details: { court?: string; date?: string; scheduledTime?: string; score1?: number; score2?: number }) => {
    const updatePayload: any = {};
    if (details.court !== undefined) updatePayload.court = details.court;
    if (details.date !== undefined) updatePayload.date = details.date;
    if (details.scheduledTime !== undefined) updatePayload.scheduledTime = details.scheduledTime;
    if (details.score1 !== undefined) updatePayload.team1_score = details.score1;
    if (details.score2 !== undefined) updatePayload.team2_score = details.score2;
    const { error } = await supabase.from('matches').update(updatePayload).eq('id', matchId);
    if (error) console.error('Error updating match details:', error);
    await fetchData();
  }, [fetchData]);

  const updateMatchScore = useCallback(async (tournamentId: string, matchId: string, team: 'team1' | 'team2') => {
    const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('team1_score, team2_score')
        .eq('id', matchId)
        .single();

    if (fetchError || !match) {
        console.error("Could not fetch match to update score:", fetchError);
        return;
    }

    const scoreField = team === 'team1' ? 'team1_score' : 'team2_score';
    const currentScore = team === 'team1' ? match.team1_score : match.team2_score;

    const { error: updateError } = await supabase
        .from('matches')
        .update({ [scoreField]: currentScore + 1 })
        .eq('id', matchId);

    if (updateError) {
        console.error(`Error updating ${team} score:`, updateError);
    } else {
        await fetchData();
    }
  }, [fetchData]);

  const startMatch = useCallback(async (tournamentId: string, matchId: string) => {
    const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);
    if (error) console.error('Error starting match:', error);
    await fetchData();
  }, [fetchData]);

  const finishMatch = useCallback(async (tournamentId: string, matchId: string, score1?: number, score2?: number) => {
    const updatePayload: any = { status: 'finished' };
     if (score1 !== undefined) updatePayload.team1_score = score1;
    if (score2 !== undefined) updatePayload.team2_score = score2;
    const { error } = await supabase.from('matches').update(updatePayload).eq('id', matchId);
    if (error) console.error('Error finishing match:', error);
    await fetchData();
  }, [fetchData]);

  const generateAutomaticBracket = useCallback(async (tournamentId: string, categoryId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    const categoryTeams = tournament.teams.filter(t => t.categoryId === categoryId);
    if (categoryTeams.length < 2) { alert('Não há equipes suficientes.'); return; }
    
    const shuffledTeams = [...categoryTeams].sort(() => Math.random() - 0.5);
    const newMatches = [];
    for (let i = 0; i < Math.floor(shuffledTeams.length / 2) * 2; i += 2) {
      newMatches.push({
        tournament_id: tournamentId, category_id: categoryId, team1_id: shuffledTeams[i].id, team2_id: shuffledTeams[i + 1].id,
        round: 1, court: tournament.courts[i % tournament.courts.length] || 'A definir', status: 'upcoming', team1_score: 0, team2_score: 0
      });
    }
    const { error } = await supabase.from('matches').insert(newMatches);
    if (error) console.error('Error generating bracket:', error);
    await fetchData();
  }, [fetchData, tournaments]);

  const clearUpcomingMatches = useCallback(async (tournamentId: string, categoryId: string) => {
    const { error } = await supabase.from('matches').delete().eq('tournament_id', tournamentId).eq('category_id', categoryId).eq('status', 'upcoming');
    if (error) console.error('Error clearing matches:', error);
    await fetchData();
  }, [fetchData]);

  const selectedTournament = useMemo(() => tournaments.find(t => t.id === selectedTournamentId) || null, [tournaments, selectedTournamentId]);
  const featuredMatches = useMemo(() => selectedTournament?.matches.filter(m => featuredMatchIds.includes(m.id)) || [], [selectedTournament, featuredMatchIds]);
  const liveMatch = useMemo(() => selectedTournament?.matches.find(m => m.status === 'live'), [selectedTournament]);
  const upcomingMatches = useMemo(() => selectedTournament?.matches.filter(m => m.status === 'upcoming').sort((a, b) => (a.court > b.court) ? 1 : -1) || [], [selectedTournament]);
  const finishedMatches = useMemo(() => selectedTournament?.matches.filter(m => m.status === 'finished') || [], [selectedTournament]);

  const contextValue = useMemo(() => ({
    tournaments, selectedTournament, liveMatch, upcomingMatches, finishedMatches, selectTournament, addTournament, updateTournament, deleteTournament, addTeam, addSponsor, deleteSponsor, createMatch, updateMatchDetails, updateMatchScore, startMatch, finishMatch, generateAutomaticBracket, clearUpcomingMatches, featuredMatches, toggleFeaturedMatch, clearFeaturedMatches, backgroundImage, logoImage, primaryTextColor, secondaryTextColor, updateTournamentBranding, updateTournamentColors, isLoading
  }), [
    tournaments, selectedTournament, liveMatch, upcomingMatches, finishedMatches, selectTournament, addTournament, updateTournament, deleteTournament, addTeam, addSponsor, deleteSponsor, createMatch, updateMatchDetails, updateMatchScore, startMatch, finishMatch, generateAutomaticBracket, clearUpcomingMatches, featuredMatches, toggleFeaturedMatch, clearFeaturedMatches, backgroundImage, logoImage, primaryTextColor, secondaryTextColor, updateTournamentBranding, updateTournamentColors, isLoading
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
