import { useState, useCallback, useEffect } from 'react';

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${(err as Error).message} (${(err as Error).name})`);
        alert(`Não foi possível ativar o modo de tela cheia. Verifique as permissões do navegador ou tente em um ambiente de produção.`);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
};

export default useFullscreen;
