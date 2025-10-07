import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  CalendarDaysIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Composant Navbar pour la navigation principale
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Gestion de la déconnexion
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  /**
   * Vérifier si un lien est actif
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  /**
   * Liens de navigation
   */
  const navigationLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: isActive('/dashboard'),
    },
    {
      name: 'Planning',
      href: '/planning',
      icon: CalendarDaysIcon,
      current: isActive('/planning'),
    },
  ];

  const adminLinks = [
    {
      name: 'Administration',
      href: '/admin',
      icon: Cog6ToothIcon,
      current: isActive('/admin'),
    },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                OSEF Intranet
              </h1>
            </div>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Liens de navigation principaux */}
            <div className="flex items-center space-x-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`${
                    link.current
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center`}
                >
                  <link.icon className="w-5 h-5 mr-2" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Liens d'administration */}
            {isAdmin && (
              <div className="flex items-center space-x-4 border-l border-secondary-200 pl-4">
                {adminLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`${
                      link.current
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                    } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center`}
                  >
                    <link.icon className="w-5 h-5 mr-2" />
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Menu utilisateur */}
            <div className="flex items-center space-x-4 border-l border-secondary-200 pl-4">
              <Link
                to="/profile"
                className={`${
                  isActive('/profile')
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center`}
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Profil
              </Link>

              <button
                onClick={handleLogout}
                className="text-secondary-700 hover:text-danger-600 hover:bg-danger-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Menu mobile - bouton hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-secondary-200">
            {/* Liens principaux */}
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`${
                  link.current
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center`}
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5 mr-2" />
                {link.name}
              </Link>
            ))}

            {/* Liens d'administration pour mobile */}
            {isAdmin && (
              <>
                <div className="border-t border-secondary-200 pt-2">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`${
                        link.current
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                      } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center`}
                      onClick={() => setIsOpen(false)}
                    >
                      <link.icon className="w-5 h-5 mr-2" />
                      {link.name}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Profil et déconnexion pour mobile */}
            <div className="border-t border-secondary-200 pt-2 space-y-1">
              <Link
                to="/profile"
                className={`${
                  isActive('/profile')
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-secondary-700 hover:text-primary-600 hover:bg-primary-50'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center`}
                onClick={() => setIsOpen(false)}
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Profil
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="text-secondary-700 hover:text-danger-600 hover:bg-danger-50 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
