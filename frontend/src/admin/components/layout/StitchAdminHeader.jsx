import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';

export default function StitchAdminHeader({ onMenuToggle, searchValue, onSearchChange }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [openMenu, setOpenMenu] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (event.key === 'Escape') setOpenMenu('');
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  const toggleMenu = (menu) => setOpenMenu((current) => current === menu ? '' : menu);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface/95 px-6 shadow-sm backdrop-blur-sm max-md:gap-3 max-md:px-4">
      <div className="flex w-full max-w-2xl flex-1 items-center gap-6">
        <button
          aria-label="Ouvrir le menu d’administration"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant max-md:inline-flex"
          onClick={onMenuToggle}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined">menu</span>
        </button>
        <label className="relative w-full max-w-md">
          <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-outline">search</span>
          <input
            aria-label="Rechercher dans les colis de démonstration"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-1.5 pl-9 pr-12 text-body-sm font-body-sm text-on-surface shadow-xs transition-all placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/15"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="⌘K Rechercher colis, client, conteneur ou bordereau..."
            ref={searchRef}
            type="search"
            value={searchValue}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <div className="mx-1 h-6 w-px bg-outline-variant" />
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              aria-expanded={openMenu === 'notifications'}
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
              onClick={() => toggleMenu('notifications')}
              title="Notifications"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 animate-pulse rounded-full bg-error ring-2 ring-surface" />
            </button>
            {openMenu === 'notifications' && (
              <div className="corelink-admin-popover p-4">
                <div className="mb-3 flex items-center justify-between">
                  <strong className="text-title-sm font-title-sm">Notifications</strong>
                  <span className="rounded-full bg-error-container px-2 py-0.5 text-label-sm text-on-error-container">2 exemples</span>
                </div>
                <p className="border-t border-outline-variant/50 py-3 text-body-sm text-on-surface-variant">
                  4 colis nécessitent une vérification douanière.
                </p>
                <p className="border-t border-outline-variant/50 pt-3 text-body-sm text-on-surface-variant">
                  Prochain départ cargo aérien dans 4 h 30.
                </p>
                <p className="mt-3 text-label-sm text-outline">Notifications de démonstration, non issues d’un serveur.</p>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              aria-expanded={openMenu === 'help'}
              aria-label="Aide opérationnelle"
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
              onClick={() => toggleMenu('help')}
              title="Aide opérationnelle"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl">help</span>
            </button>
            {openMenu === 'help' && (
              <div className="corelink-admin-popover p-4">
                <strong className="text-title-sm font-title-sm">Aide opérationnelle</strong>
                <p className="mt-2 text-body-sm text-on-surface-variant">Le tableau de bord présente des données d’exemple. Les opérations métier ne sont pas encore connectées à l’API.</p>
              </div>
            )}
          </div>
          <button
            aria-label="Ouvrir les paramètres"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            onClick={() => navigate('/admin/settings')}
            title="Configuration"
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
        <div className="relative ml-2 border-l border-outline-variant pl-2">
          <button
            aria-expanded={openMenu === 'profile'}
            aria-label="Menu du profil"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary shadow-xs ring-1 ring-outline-variant"
            onClick={() => toggleMenu('profile')}
            type="button"
          >
            BO
          </button>
          {openMenu === 'profile' && (
            <div className="corelink-admin-popover p-4">
              <strong className="text-title-sm font-title-sm">{user?.name || 'Administrateur'}</strong>
              <p className="mt-1 text-body-sm text-on-surface-variant">{user?.email || 'Compte de démonstration'}</p>
              <p className="mb-3 mt-1 text-label-sm capitalize text-outline">{user?.role || 'admin'}</p>
              {error && <p className="mb-3 text-body-sm text-error">{error}</p>}
              <button
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-left text-body-sm font-semibold text-on-surface hover:bg-surface-container-low"
                onClick={handleLogout}
                type="button"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <div className="sr-only" role="alert">{error}</div>}
      <span className="sr-only" aria-live="polite">{error || ''}</span>
    </header>
  );
}
