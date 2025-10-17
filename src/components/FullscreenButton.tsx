import React from 'react';
import { Expand, Minimize } from 'lucide-react';
import useFullscreen from '../hooks/useFullscreen';

const FullscreenButton: React.FC = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      onClick={toggleFullscreen}
      className="bg-gray-800 bg-opacity-50 text-white rounded-full p-4 shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 transition-transform transform hover:scale-110"
      aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
      title={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
    >
      {isFullscreen ? <Minimize size={28} /> : <Expand size={28} />}
    </button>
  );
};

export default FullscreenButton;
