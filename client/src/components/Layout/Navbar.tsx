import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-gray-900' : '';
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white text-xl font-bold">CareCost</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${isActive('/')} text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700`}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/vehicles"
                  className={`${isActive('/vehicles')} text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700`}
                >
                  Véhicules
                </Link>
                <Link
                  to="/statistics"
                  className={`${isActive('/statistics')} text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700`}
                >
                  Statistiques
                </Link>
                <Link
                  to="/maintenance"
                  className={`${isActive('/maintenance')} text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700`}
                >
                  Maintenance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}; 