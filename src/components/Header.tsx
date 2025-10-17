import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FullscreenButton from './FullscreenButton';
import AdminLink from './AdminLink';

const Header: React.FC = () => {
  const { logoImage } = useData();
  return (
    <header className="fixed top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
      <div className="pointer-events-auto">
        <Link to="/">
          <img src={logoImage} alt="Logo da Arena" className="h-20 w-auto object-contain" />
        </Link>
      </div>
      <div className="flex items-center gap-4 pointer-events-auto">
        <FullscreenButton />
        <AdminLink />
      </div>
    </header>
  );
};

export default Header;
