import { useState, useEffect, useCallback } from 'react';

export const useTournamentNav = (initialState = false) => {
    const [isNavVisible, setIsNavVisible] = useState(initialState);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'm') {
            setIsNavVisible(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const toggleNav = useCallback(() => {
        setIsNavVisible(prev => !prev);
    }, []);

    return { isNavVisible, toggleNav };
};
