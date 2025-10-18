import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Team, Match, Player, Tournament, TournamentCategory, Sponsor, TournamentColors, TournamentFormat, GroupStageSettings, KnockoutSettings, GroupStanding, MatchStage } from '../types';
import { supabase } from '../lib/supabaseClient';
import { faker } from '@faker-js/faker';

const DEFAULT_BG = "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2807&auto=format&fit=crop";
const DEFAULT_LOGO = "https://i.ibb.co/L8yT7gM/match-point-sports-logo.png";
const DEFAULT_PRIMARY_COLOR = '#FFFFFF';
const DEFAULT_SECONDARY_COLOR = '#FFD700';

interface DataContextType {
  tournaments: Tournament[];
  standings: GroupStanding[];
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
  updateTeam: (teamId: string, teamName: string, players: { id: string; name: string }[]) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addSponsor: (tournamentId: string, name: string, logo: string) => Promise<void>;
  deleteSponsor: (tournamentId: string, sponsorId: string) => Promise<void>;
  createMatch: (tournamentId: string, categoryId: string, team1Id: string, team2Id: string, round: number, court: string, scheduledTime: string) => Promise<void>;
  updateMatchDetails: (tournamentId: string, matchId: string, details: { court?: string; date?: string; scheduledTime?: string; score1?: number; score2?: number }) => Promise<void>;
  updateMatchScore: (tournamentId: string, matchId: string, team: 'team1' | 'team2') => Promise<void>;
  startMatch: (tournamentId: string, matchId: string) => Promise<void>;
  finishMatch: (tournamentId: string, matchId: string, score1?: number, score2?: number) => Promise<void>;
  resetMatch: (tournamentId: string, matchId: string) => Promise<void>;
  generateAutomaticBracket: (tournamentId: string, categoryId: string) => Promise<void>;
  resetBracket: (tournamentId: string, categoryId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [standings, setStandings] = useState<GroupStanding[]>([]);
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
    const { data: matchesData, error: matchesError } = await supabase.from('matches').select('*, created_at');
    const { data: sponsorsData, error: sponsorsError } = await supabase.from('sponsors').select('*');
    const { data: standingsData, error: standingsError } = await supabase.from('group_standings').select('*');

    if (tournamentsError || categoriesError || teamsError || playersError || matchesError || sponsorsError || standingsError) {
      console.error("Error fetching data:", { tournamentsError, categoriesError, teamsError, playersError, matchesError, sponsorsError, standingsError });
      setIsLoading(false);
      return;
    }

    const teamsMap = new Map<string, Team>();
    teamsData.forEach(team => {
      const teamPlayers = playersData
        .filter(p => p.team_id === team.id)
        .map(p => ({ id: p.id, name: p.name }));
      
      teamsMap.set(team.id, {
        id: team.id, name: team.name, players: teamPlayers, categoryId: team.category_id, groupName: team.group_name
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
            scheduledTime: match.scheduled_time, status: match.status, stage: match.stage, categoryId: match.category_id,
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
        modality: tourney.modality, format: tourney.format, groupSettings: tourney.group_settings, knockoutSettings: tourney.knockout_settings,
        startDate: tourney.startDate, endDate: tourney.endDate, startTime: tourney.startTime, endTime: tourney.endTime, courts: tourney.courts,
        backgroundImage: tourney.backgroundImage, logoImage: tourney.logoImage, colors: tourney.colors,
        categories: tournamentCategories, teams: tournamentTeams, matches: tournamentMatches, sponsors: tournamentSponsors,
      };
    });

    setTournaments(assembledTournaments);
    setStandings(standingsData || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectTournament = useCallback((tournamentId: string | null) => {
    setSelectedTournamentId(tournamentId);
  }, []);

  useEffect(() => {
    setFeaturedMatchIds([]);
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

  const selectedTournament = useMemo(() => tournaments.find(t => t.id === selectedTournamentId) || null, [tournaments, selectedTournamentId]);
  const featuredMatches = useMemo(() => selectedTournament?.matches.filter(m => featuredMatchIds.includes(m.id)) || [], [selectedTournament, featuredMatchIds]);
  const liveMatch = useMemo(() => selectedTournament?.matches.find(m => m.status === 'live'), [selectedTournament]);
  const upcomingMatches = useMemo(() => selectedTournament?.matches.filter(m => m.status === 'upcoming').sort((a, b) => (a.court > b.court) ? 1 : -1) || [], [selectedTournament]);
  const finishedMatches = useMemo(() => selectedTournament?.matches.filter(m => m.status === 'finished') || [], [selectedTournament]);

  const updateTournamentBranding = useCallback(async (tournamentId: string, urls: { bg?: string; logo?: string }) => {
    const { error } = await supabase.from('tournaments').update({ backgroundImage: urls.bg, logoImage: urls.logo }).eq('id', tournamentId);
    if (error) console.error("Error updating branding:", error); else await fetchData();
  }, [fetchData]);

  const updateTournamentColors = useCallback(async (tournamentId: string, colors: TournamentColors) => {
    const { error } = await supabase.from('tournaments').update({ colors }).eq('id', tournamentId);
    if (error) console.error("Error updating colors:", error); else await fetchData();
  }, [fetchData]);

  const toggleFeaturedMatch = useCallback((matchId: string) => {
    setFeaturedMatchIds(prev => prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]);
  }, []);

  const clearFeaturedMatches = useCallback(() => setFeaturedMatchIds([]), []);

  const addTournament = useCallback(async (data: Omit<Tournament, 'id' | 'teams' | 'matches' | 'backgroundImage' | 'logoImage' | 'sponsors' | 'colors'>) => {
    const { data: newTournamentData, error: tournamentError } = await supabase.from('tournaments').insert({
      name: data.name, tournamentType: data.tournamentType, status: data.status, modality: data.modality,
      format: data.format, group_settings: data.groupSettings, knockout_settings: data.knockoutSettings,
      startDate: data.startDate, endDate: data.endDate, startTime: data.startTime, endTime: data.endTime, courts: data.courts,
      backgroundImage: DEFAULT_BG, logoImage: DEFAULT_LOGO, colors: { primary: DEFAULT_PRIMARY_COLOR, secondary: DEFAULT_SECONDARY_COLOR }
    }).select().single();
    if (tournamentError) { console.error('Error adding tournament:', tournamentError); return; }
    const categoriesToInsert = data.categories.map(cat => ({
      tournament_id: newTournamentData.id, group: cat.group, level: cat.level, prize1: cat.prize1, prize2: cat.prize2, prize3: cat.prize3,
      max_entries: cat.maxEntries, entry_fee: cat.entryFee,
    }));
    const { error: categoriesError } = await supabase.from('categories').insert(categoriesToInsert);
    if (categoriesError) console.error('Error adding categories:', categoriesError); else await fetchData();
  }, [fetchData]);

  const updateTournament = useCallback(async (tournamentId: string, data: Partial<Omit<Tournament, 'id' | 'categories' | 'teams' | 'matches' | 'sponsors' | 'colors'>>, categoriesToUpdate: Partial<TournamentCategory>[]) => {
    const { error: tournamentError } = await supabase.from('tournaments').update({
        name: data.name, tournamentType: data.tournamentType, status: data.status, modality: data.modality,
        format: data.format, group_settings: data.groupSettings, knockout_settings: data.knockoutSettings,
        startDate: data.startDate, endDate: data.endDate, startTime: data.startTime, endTime: data.endTime, courts: data.courts,
    }).eq('id', tournamentId);
    if (tournamentError) { console.error('Error updating tournament:', tournamentError); return; }

    const { data: originalCategories, error: fetchCatError } = await supabase.from('categories').select('id').eq('tournament_id', tournamentId);
    if (fetchCatError) { console.error('Could not fetch original categories for deletion check'); await fetchData(); return; }

    const categoriesToUpsert = categoriesToUpdate.map(cat => ({
        id: cat.id || faker.string.uuid(),
        tournament_id: tournamentId,
        group: cat.group, level: cat.level, prize1: cat.prize1, prize2: cat.prize2, prize3: cat.prize3,
        max_entries: cat.maxEntries, entry_fee: cat.entryFee,
    }));
    
    const { data: upsertedData, error: upsertError } = await supabase.from('categories').upsert(categoriesToUpsert, { onConflict: 'id' }).select('id');
    if (upsertError) { console.error('Error upserting categories:', upsertError); alert(`Erro ao salvar categorias: ${upsertError.message}`); await fetchData(); return; }

    const submittedCategoryIds = new Set(upsertedData.map(c => c.id));
    const categoriesToDelete = originalCategories.filter(c => !submittedCategoryIds.has(c.id)).map(c => c.id);
    
    if (categoriesToDelete.length > 0) {
        const { data: teamsInCategory, error: teamsError } = await supabase.from('teams').select('id').in('category_id', categoriesToDelete);
        if (teamsError) { alert('Erro ao verificar equipes inscritas antes de deletar categoria.'); return; }
        if (teamsInCategory.length > 0) { alert('Não é possível remover categorias que já possuem equipes inscritas.'); return; }
        const { error: deleteError } = await supabase.from('categories').delete().in('id', categoriesToDelete);
        if (deleteError) console.error('Error deleting categories:', deleteError);
    }
    
    await fetchData();
  }, [fetchData]);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    const { error } = await supabase.from('tournaments').delete().eq('id', tournamentId);
    if (error) console.error('Error deleting tournament:', error); else await fetchData();
  }, [fetchData]);

  const addTeam = useCallback(async (tournamentId: string, categoryId: string, teamName: string, playerNames: string[]) => {
    const { data: newTeam, error: teamError } = await supabase.from('teams').insert({ tournament_id: tournamentId, category_id: categoryId, name: teamName }).select().single();
    if (teamError) { console.error('Error adding team:', teamError); return; }
    const playersToInsert = playerNames.map(name => ({ team_id: newTeam.id, name }));
    const { error: playerError } = await supabase.from('players').insert(playersToInsert);
    if (playerError) console.error('Error adding players:', playerError); else await fetchData();
  }, [fetchData]);

  const updateTeam = useCallback(async (teamId: string, teamName: string, players: { id: string; name: string }[]) => {
    const { error: teamError } = await supabase.from('teams').update({ name: teamName }).eq('id', teamId);
    if (teamError) { console.error('Error updating team name:', teamError); return; }
    const playersToUpsert = players.map(p => ({ id: p.id, name: p.name, team_id: teamId }));
    const { error: playerError } = await supabase.from('players').upsert(playersToUpsert);
    if (playerError) console.error('Error updating players:', playerError); else await fetchData();
  }, [fetchData]);

  const deleteTeam = useCallback(async (teamId: string) => {
    const { data: matches, error: matchError } = await supabase.from('matches').select('id').or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);
    if (matchError) { alert(`Erro ao verificar partidas: ${matchError.message}`); return; }
    if (matches.length > 0) { alert('Não é possível excluir um participante que já está em um confronto.'); return; }
    const { error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);
    if (deleteError) console.error('Error deleting team:', deleteError); else await fetchData();
  }, [fetchData]);

  const addSponsor = useCallback(async (tournamentId: string, name: string, logo: string) => {
    const { error } = await supabase.from('sponsors').insert({ tournament_id: tournamentId, name, logo });
    if (error) console.error('Error adding sponsor:', error); else await fetchData();
  }, [fetchData]);

  const deleteSponsor = useCallback(async (tournamentId: string, sponsorId: string) => {
    const { error } = await supabase.from('sponsors').delete().eq('id', sponsorId);
    if (error) console.error('Error deleting sponsor:', error); else await fetchData();
  }, [fetchData]);

  const createMatch = useCallback(async (tournamentId: string, categoryId: string, team1Id: string, team2Id: string, round: number, court: string, scheduledTime: string) => {
    const { error } = await supabase.from('matches').insert({ tournament_id: tournamentId, category_id: categoryId, team1_id: team1Id, team2_id: team2Id, round, court, scheduled_time: scheduledTime, status: 'upcoming', team1_score: 0, team2_score: 0 });
    if (error) console.error('Error creating match:', error); else await fetchData();
  }, [fetchData]);

  const updateMatchDetails = useCallback(async (tournamentId: string, matchId: string, details: { court?: string; date?: string; scheduledTime?: string; score1?: number; score2?: number }) => {
    const updatePayload: any = { 
        court: details.court, 
        date: details.date === '' ? null : details.date,
        scheduled_time: details.scheduledTime, 
        team1_score: details.score1, 
        team2_score: details.score2 
    };
    
    Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined) {
            delete updatePayload[key];
        }
    });

    const { error } = await supabase.from('matches').update(updatePayload).eq('id', matchId);
    
    if (error) {
      console.error('Error updating match details:', error);
      alert(`Erro ao atualizar detalhes da partida: ${error.message}`);
    } else {
      await fetchData();
    }
  }, [fetchData]);
  
  const updateMatchScore = useCallback(async (tournamentId: string, matchId: string, team: 'team1' | 'team2') => {
    const { data: match, error: fetchError } = await supabase.from('matches').select('team1_score, team2_score').eq('id', matchId).single();
    if (fetchError || !match) { console.error("Could not fetch match to update score:", fetchError); return; }
    const scoreField = team === 'team1' ? 'team1_score' : 'team2_score';
    const currentScore = team === 'team1' ? match.team1_score : match.team2_score;
    const { error: updateError } = await supabase.from('matches').update({ [scoreField]: currentScore + 1 }).eq('id', matchId);
    if (updateError) console.error(`Error updating ${team} score:`, updateError); else await fetchData();
  }, [fetchData]);

  const startMatch = useCallback(async (tournamentId: string, matchId: string) => {
    const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);
    if (error) console.error('Error starting match:', error); else await fetchData();
  }, [fetchData]);

  const finishMatch = useCallback(async (tournamentId: string, matchId: string, score1?: number, score2?: number) => {
    const updatePayload: any = { status: 'finished' };
    if (score1 !== undefined) updatePayload.team1_score = score1;
    if (score2 !== undefined) updatePayload.team2_score = score2;
    const { error: finishError } = await supabase.from('matches').update(updatePayload).eq('id', matchId);

    if (finishError) {
      console.error('Error finishing match:', finishError);
      return;
    }

    // Bracket progression logic
    const { data: allMatchesData, error: matchesError } = await supabase.from('matches').select('*, created_at').eq('tournament_id', tournamentId);
    const { data: tournamentData, error: tourneyError } = await supabase.from('tournaments').select('courts').eq('id', tournamentId).single();

    if (matchesError || tourneyError || !allMatchesData || !tournamentData) {
      console.error("Could not fetch data for bracket progression");
      await fetchData();
      return;
    }

    const justFinishedMatch = allMatchesData.find(m => m.id === matchId);
    if (!justFinishedMatch) {
      await fetchData();
      return;
    }

    const matchesInRound = allMatchesData
      .filter(m => m.round === justFinishedMatch.round && m.category_id === justFinishedMatch.category_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const matchIndex = matchesInRound.findIndex(m => m.id === justFinishedMatch.id);
    if (matchIndex === -1) {
      await fetchData();
      return;
    }

    const siblingIndex = matchIndex % 2 === 0 ? matchIndex + 1 : matchIndex - 1;
    const siblingMatch = matchesInRound[siblingIndex];

    if (siblingMatch && siblingMatch.status === 'finished') {
      const finishedScore1 = updatePayload.team1_score ?? justFinishedMatch.team1_score;
      const finishedScore2 = updatePayload.team2_score ?? justFinishedMatch.team2_score;

      const winnerOfFinishedMatch = finishedScore1 > finishedScore2
        ? justFinishedMatch.team1_id
        : justFinishedMatch.team2_id;
      
      const winnerOfSiblingMatch = siblingMatch.team1_score > siblingMatch.team2_score
        ? siblingMatch.team1_id
        : siblingMatch.team2_id;

      const [newTeam1, newTeam2] = matchIndex < siblingIndex ? [winnerOfFinishedMatch, winnerOfSiblingMatch] : [winnerOfSiblingMatch, winnerOfFinishedMatch];
      const nextRound = justFinishedMatch.round + 1;

      const existingNextRoundMatch = allMatchesData.find(m =>
        m.round === nextRound &&
        m.category_id === justFinishedMatch.category_id &&
        ((m.team1_id === newTeam1 && m.team2_id === newTeam2) || (m.team1_id === newTeam2 && m.team2_id === newTeam1))
      );

      if (!existingNextRoundMatch) {
        const { error: createNextMatchError } = await supabase.from('matches').insert({
          tournament_id: tournamentId,
          category_id: justFinishedMatch.category_id,
          team1_id: newTeam1,
          team2_id: newTeam2,
          round: nextRound,
          court: tournamentData.courts[0] || 'A definir',
          status: 'upcoming',
          team1_score: 0,
          team2_score: 0,
        });

        if (createNextMatchError) {
          console.error("Error creating next round match:", createNextMatchError);
        }
      }
    }

    await fetchData();
  }, [fetchData]);
  
  const resetMatch = useCallback(async (tournamentId: string, matchId: string) => {
    const { data: matchToReset, error: fetchError } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (fetchError || !matchToReset) {
      alert("Não foi possível encontrar a partida para resetar.");
      return;
    }

    const winnerId = matchToReset.team1_score > matchToReset.team2_score ? matchToReset.team1_id : matchToReset.team2_id;
    const { data: nextRoundMatches, error: nextRoundError } = await supabase.from('matches').select('id').eq('tournament_id', tournamentId).eq('category_id', matchToReset.category_id).eq('round', matchToReset.round + 1).or(`team1_id.eq.${winnerId},team2_id.eq.${winnerId}`);
    
    if (nextRoundError) console.error("Error checking for next round match:", nextRoundError);

    if (nextRoundMatches && nextRoundMatches.length > 0) {
      const nextMatchIdsToDelete = nextRoundMatches.map(m => m.id);
      const { error: deleteError } = await supabase.from('matches').delete().in('id', nextMatchIdsToDelete);
      if (deleteError) {
        alert("Erro ao limpar a próxima rodada. O chaveamento pode estar inconsistente.");
      }
    }

    const { error: resetError } = await supabase.from('matches').update({ status: 'upcoming', team1_score: 0, team2_score: 0 }).eq('id', matchId);
    if (resetError) {
      alert("Erro ao resetar a partida.");
    } else {
      await fetchData();
    }
  }, [fetchData]);

  const resetBracket = useCallback(async (tournamentId: string, categoryId: string) => {
    setIsLoading(true);
    try {
        const { data: matchesToDelete, error: selectError } = await supabase.from('matches').select('id').eq('tournament_id', tournamentId).eq('category_id', categoryId);
        if (selectError) throw selectError;

        const matchIdsToDelete = matchesToDelete?.map(m => m.id) || [];
        if (matchIdsToDelete.length > 0) {
            const { error: deleteError } = await supabase.from('matches').delete().in('id', matchIdsToDelete);
            if (deleteError) throw deleteError;

            setTournaments(prevTournaments => {
                return prevTournaments.map(t => {
                    if (t.id === tournamentId) {
                        const updatedMatches = t.matches.filter(m => !matchIdsToDelete.includes(m.id));
                        return { ...t, matches: updatedMatches };
                    }
                    return t;
                });
            });
        }
        alert('Chaveamento resetado com sucesso!');
    } catch (e: any) {
        console.error("An unexpected error occurred during bracket reset:", e);
        alert(`Ocorreu um erro inesperado: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const generateAutomaticBracket = useCallback(async (tournamentId: string, categoryId: string) => {
    setIsLoading(true);
    try {
        const { data: matchesToDelete, error: selectError } = await supabase.from('matches').select('id').eq('tournament_id', tournamentId).eq('category_id', categoryId);
        if (selectError) throw selectError;

        const matchIdsToDelete = matchesToDelete?.map(m => m.id) || [];
        if (matchIdsToDelete.length > 0) {
            const { error: deleteError } = await supabase.from('matches').delete().in('id', matchIdsToDelete);
            if (deleteError) throw deleteError;
        }

        const { data: tournamentData, error: tourneyError } = await supabase.from('tournaments').select('courts').eq('id', tournamentId).single();
        const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id').eq('tournament_id', tournamentId).eq('category_id', categoryId);
        if (tourneyError || teamsError || !tournamentData || !teamsData) throw new Error('Erro ao buscar dados para gerar chave.');
        if (teamsData.length < 2) {
            alert('Não há equipes suficientes para gerar um chaveamento.');
            setIsLoading(false);
            return;
        }

        const shuffledTeams = [...teamsData].sort(() => Math.random() - 0.5);
        const newMatchesToInsert = [];
        for (let i = 0; i < Math.floor(shuffledTeams.length / 2) * 2; i += 2) {
            newMatchesToInsert.push({
                tournament_id: tournamentId, category_id: categoryId, team1_id: shuffledTeams[i].id, team2_id: shuffledTeams[i + 1].id,
                round: 1, court: tournamentData.courts[i % tournamentData.courts.length] || 'A definir', status: 'upcoming', team1_score: 0, team2_score: 0
            });
        }

        if (newMatchesToInsert.length > 0) {
            const { data: insertedMatchesData, error: insertError } = await supabase.from('matches').insert(newMatchesToInsert).select();
            if (insertError) throw insertError;

            setTournaments(prevTournaments => {
                return prevTournaments.map(t => {
                    if (t.id === tournamentId) {
                        const matchesWithoutOld = t.matches.filter(m => !matchIdsToDelete.includes(m.id));
                        const allTeamsInTournament = t.teams;
                        
                        const newAssembledMatches: Match[] = insertedMatchesData.map(newMatch => {
                            const team1 = allTeamsInTournament.find(team => team.id === newMatch.team1_id);
                            const team2 = allTeamsInTournament.find(team => team.id === newMatch.team2_id);
                            if (!team1 || !team2) return null;
                            return {
                                id: newMatch.id, round: newMatch.round, court: newMatch.court, date: newMatch.date,
                                scheduledTime: newMatch.scheduled_time, status: newMatch.status, stage: newMatch.stage, categoryId: newMatch.category_id,
                                team1: { team: team1, score: newMatch.team1_score },
                                team2: { team: team2, score: newMatch.team2_score },
                            };
                        }).filter((m): m is Match => m !== null);

                        return { ...t, matches: [...matchesWithoutOld, ...newAssembledMatches] };
                    }
                    return t;
                });
            });
        } else if (matchIdsToDelete.length > 0) {
            setTournaments(prevTournaments => {
                return prevTournaments.map(t => {
                    if (t.id === tournamentId) {
                        const updatedMatches = t.matches.filter(m => !matchIdsToDelete.includes(m.id));
                        return { ...t, matches: updatedMatches };
                    }
                    return t;
                });
            });
        }
    } catch (e: any) {
        console.error("An unexpected error occurred during bracket generation:", e);
        alert(`Ocorreu um erro inesperado: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    tournaments, standings, selectedTournament, liveMatch, upcomingMatches, finishedMatches, featuredMatches, backgroundImage, logoImage, primaryTextColor, secondaryTextColor, isLoading,
    selectTournament, addTournament, updateTournament, deleteTournament, addTeam, updateTeam, deleteTeam, addSponsor, deleteSponsor, createMatch, updateMatchDetails, updateMatchScore, startMatch, finishMatch, resetMatch, generateAutomaticBracket, resetBracket, toggleFeaturedMatch, clearFeaturedMatches, updateTournamentBranding, updateTournamentColors
  }), [
    tournaments, standings, selectedTournament, liveMatch, upcomingMatches, finishedMatches, featuredMatches, backgroundImage, logoImage, primaryTextColor, secondaryTextColor, isLoading,
    selectTournament, addTournament, updateTournament, deleteTournament, addTeam, updateTeam, deleteTeam, addSponsor, deleteSponsor, createMatch, updateMatchDetails, updateMatchScore, startMatch, finishMatch, resetMatch, generateAutomaticBracket, resetBracket, toggleFeaturedMatch, clearFeaturedMatches, updateTournamentBranding, updateTournamentColors
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
