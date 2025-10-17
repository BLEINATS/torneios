import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CurrentMatch from '../components/CurrentMatch';
import UpcomingMatchCard from '../components/UpcomingMatchCard';
import { useData } from '../context/DataContext';
import TournamentNav from '../components/TournamentNav';
import { Match } from '../types';
import EditMatchModal from '../components/admin/EditMatchModal';
import { useTournamentNav } from '../hooks/useTournamentNav';

export const Scoreboard: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { 
    selectedTournament, 
    selectTournament, 
    liveMatch, 
    upcomingMatches, 
    featuredMatches, 
    toggleFeaturedMatch,
    primaryTextColor,
    secondaryTextColor
  } = useData();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null);
  const { isNavVisible, toggleNav } = useTournamentNav();

  useEffect(() => {
    if (tournamentId) {
      selectTournament(tournamentId);
    } else {
      navigate('/');
    }
  }, [tournamentId, selectTournament, navigate]);

  const matchesToShow = useMemo(() => {
    if (featuredMatches.length > 0) {
        return featuredMatches;
    }
    if (liveMatch) {
        return [liveMatch];
    }
    return [];
  }, [featuredMatches, liveMatch]);

  useEffect(() => {
    if (matchesToShow.length <= 1) {
      setCarouselIndex(0);
      return;
    }

    const timerId = setTimeout(() => {
      setCarouselIndex(prevIndex => (prevIndex + 1) % matchesToShow.length);
    }, 5000);

    return () => clearTimeout(timerId);
  }, [matchesToShow.length, carouselIndex]);


  const handleOpenEditModal = (match: Match) => {
    setMatchToEdit(match);
    setIsEditModalOpen(true);
  };

  const currentMatchInCarousel = matchesToShow[carouselIndex];

  const getDisplayTitle = (match: Match, isFeatured: boolean) => {
    if (isFeatured) {
      if (match.status === 'finished') return 'Resultado em Destaque';
      if (match.status === 'upcoming') return 'Próximo Jogo em Destaque';
      return 'Partida em Destaque';
    }
    if (match.status === 'live') {
      return 'Partida Ao Vivo';
    }
    return '';
  };

  if (!selectedTournament) {
    return (
        <div className="flex items-center justify-center h-full pt-32">
            <h2 className="text-3xl font-bold" style={{ color: primaryTextColor }}>Carregando torneio...</h2>
        </div>
    )
  }

  const categoriesText = selectedTournament.categories.map(c => `${c.group}/${c.level}`).join(' | ');

  return (
    <div className="p-6 pt-32 h-full flex flex-col">
       <EditMatchModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        match={matchToEdit}
        tournament={selectedTournament}
      />
      <div 
        className="w-full py-4 flex items-center justify-center text-center cursor-pointer pointer-events-auto"
        onClick={toggleNav}
        title="Clique para exibir/ocultar o menu (ou pressione 'M')"
      >
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-shadow-lg" style={{ color: primaryTextColor }}>{selectedTournament.name}</h1>
          <p className="text-lg lg:text-xl capitalize" style={{ color: secondaryTextColor }}>{categoriesText}</p>
        </div>
      </div>
      
      <AnimatePresence>
        {isNavVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TournamentNav />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
        <main className="lg:col-span-3 flex flex-col items-center justify-center gap-4">
          {currentMatchInCarousel ? (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMatchInCarousel.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    <h2 className="text-3xl font-bold text-shadow-md text-center mb-4" style={{ color: secondaryTextColor }}>{getDisplayTitle(currentMatchInCarousel, featuredMatches.length > 0)}</h2>
                    <CurrentMatch match={currentMatchInCarousel} modality={selectedTournament.modality} />
                </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center mt-8">
              <h2 className="text-4xl font-bold text-shadow-md" style={{ color: primaryTextColor }}>Nenhuma partida em destaque.</h2>
              <p className="text-xl text-gray-300 mt-4">Vá para a tela "Gerenciar" para destacar um jogo no telão.</p>
            </div>
          )}
          {matchesToShow.length > 1 && (
            <div className="flex gap-2 mt-4">
                {matchesToShow.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCarouselIndex(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${index === carouselIndex ? 'bg-brand-yellow' : 'bg-gray-600'}`}
                        aria-label={`Ir para o jogo ${index + 1}`}
                    />
                ))}
            </div>
          )}
        </main>

        <aside className="lg:col-span-1 bg-black bg-opacity-30 p-6 rounded-lg flex flex-col max-h-[calc(100vh-300px)] overflow-y-auto">
          <h3 className="text-2xl font-bold text-shadow mb-4" style={{ color: secondaryTextColor }}>Próximos Jogos</h3>
          <div className="flex flex-col gap-4">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.map((match, index) => (
                <UpcomingMatchCard 
                  key={match.id} 
                  match={match} 
                  index={index} 
                  modality={selectedTournament.modality} 
                  onCardClick={handleOpenEditModal}
                  isFeatured={featuredMatches.some(fm => fm.id === match.id)}
                  onToggleFeature={toggleFeaturedMatch}
                />
              ))
            ) : (
              <p className="text-gray-400">Nenhum jogo na fila.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
