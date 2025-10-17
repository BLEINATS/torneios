import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import { Scoreboard } from './pages/Scoreboard';
import Results from './pages/Results';
import Admin from './pages/Admin';
import AdminLink from './components/AdminLink';
import TournamentSelector from './pages/TournamentSelector';
import { Bracket } from './pages/Bracket';
import { MatchControl } from './pages/MatchControl';
import { useData } from './context/DataContext';
import Sponsors from './components/Sponsors';

function App() {
  const location = useLocation();
  const { backgroundImage, isLoading } = useData();

  // Show sponsors only on tournament-specific pages
  const showSponsors = location.pathname.startsWith('/tournament/');

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center transition-all duration-500"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-dark-overlay z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-yellow"></div>
        </div>
      )}
      <div className="absolute inset-0 bg-dark-overlay pointer-events-none" />
      <div className={`relative z-10 min-h-screen flex flex-col ${showSponsors ? 'pb-24' : ''}`}>
        <Header />
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<TournamentSelector />} />
              <Route path="/tournament/:tournamentId" element={<Scoreboard />} />
              <Route path="/tournament/:tournamentId/results" element={<Results />} />
              <Route path="/tournament/:tournamentId/bracket" element={<Bracket />} />
              <Route path="/tournament/:tournamentId/control" element={<MatchControl />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AnimatePresence>
        </main>
        {showSponsors && <Sponsors />}
        <AdminLink />
      </div>
    </div>
  );
}

export default App;
