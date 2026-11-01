import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';
import { canAccessAdminPath } from '../../routes/permissions.js';

const navigationGroups = [
  {
    label: 'Opérations Logistiques',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'inventory_2', count: '1 428', exact: true },
      { to: '/admin/parcels', label: 'Gestion des colis', icon: 'warehouse', count: '84' },

    ],
  },
  {
    label: 'Supervision Hub',
    links: [
      { to: '/admin/tracking', label: 'Tarifs & Devis', icon: 'monitoring' },
      { to: '/admin/users', label: 'Gestion des Profils', icon: 'manage_accounts' },
    ],
  },
];

function SidebarLink({ link, onNavigate, role }) {
  const allowed = canAccessAdminPath(role, link.to);
  if (!allowed) return null;

  return (
    <NavLink
      className={({ isActive }) => (
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 ${
          isActive
            ? 'bg-surface-container-high font-semibold text-secondary'
            : 'font-normal text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }`
      )}
      end={link.exact}
      key={`${link.to}-${link.label}`}
      onClick={onNavigate}
      to={link.to}
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined"
        style={link.exact ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {link.icon}
      </span>
      <span className="text-label-md font-label-md">{link.label}</span>
      {link.count && (
        <span className={`ml-auto rounded px-1.5 py-0.5 text-label-sm font-label-sm ${
          link.warning
            ? 'bg-amber-100 font-semibold text-amber-800'
            : link.exact
              ? 'rounded-full bg-secondary px-2 text-on-secondary'
              : 'bg-surface-container-high text-on-surface-variant'
        }`}
        >
          {link.count}
        </span>
      )}
    </NavLink>
  );
}

export default function StitchAdminSidebar({ open, onNavigate, onNotice, onLogout }) {
  const { user } = useAdminAuth();

  return (
    <>
      <button
        aria-label="Fermer le menu d’administration"
        className={`corelink-admin-menu-overlay ${open ? 'is-visible' : ''}`}
        onClick={onNavigate}
        type="button"
      />
      <aside className={`corelink-admin-sidebar fixed left-0 top-0 z-30 flex h-screen w-64 shrink-0 select-none flex-col border-r border-outline-variant bg-surface-container-lowest ${
        open ? 'is-open' : ''
      }`}
      >
        <div className="flex items-center gap-3 border-b border-outline-variant p-4">
          <img
            alt="Logo CoreLink Administration"
            className="h-10 w-10 shrink-0 rounded-lg border border-outline-variant/40 object-contain shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfy9YGHRV4MaqaC_tPPk92vs5enbBPepX-_FFNFM6aPN6wr77plQYN52GjEL3KL7iQ-pj_FDigFPXRoSwP1hco5UmhmRGdgeI4rFBa1mjsB1hGsjDha1XRwpzKvaHylbei4qPH1tLE0puqEXkanxyylG2Uqa1coYm-V736FJYO1loZPmkmjK4kB_-Pb4ChRXjKFGTxBBsIznimO9RvgA7Vh1mHZz96VdUSabYWkm3mCQKFSh81-uZT"
          />
          <div className="overflow-hidden">
            <h1 className="truncate text-title-md font-title-md font-bold leading-tight tracking-tight text-on-surface">CoreLink BO</h1>
            <p className="truncate text-label-sm font-label-sm text-on-surface-variant">Transit GZ-TNR Hub</p>
          </div>
        </div>

        <div className="px-4 pb-2 pt-4">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-title-sm font-title-sm text-on-secondary shadow-sm transition-all duration-150 hover:bg-secondary-container active:scale-[0.99]"
            onClick={() => onNotice('Scanner de réception — cette fonctionnalité sera connectée dans une prochaine étape.')}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">qr_code_scanner</span>
            Scanner Réception
          </button>
        </div>

        <nav aria-label="Navigation administrative" className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navigationGroups.map((group, groupIndex) => (
            <React.Fragment key={group.label}>
              <div className={`${groupIndex ? 'pt-3' : ''} px-3 pb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wider text-outline`}>
                {group.label}
              </div>
              {group.links.map((link) => (
                <SidebarLink key={`${link.to}-${link.label}`} link={link} onNavigate={onNavigate} role={user?.role} />
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="space-y-1 border-t border-outline-variant bg-surface-container-lowest/80 p-3">
          {canAccessAdminPath(user?.role, '/admin/settings') && (
            <NavLink
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-normal text-on-surface-variant transition-all duration-150 hover:bg-surface-container-low hover:text-on-surface"
              onClick={onNavigate}
              to="/admin/settings"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-outline">tune</span>
              <span className="text-label-md font-label-md">Paramètres Hub</span>
            </NavLink>
          )}
          <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2">
            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-label-md font-bold text-on-secondary ring-2 ring-white">
                {(user?.name || 'RH').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="truncate">
                <p className="truncate text-label-md font-label-md font-semibold leading-tight text-on-surface">{user?.name || 'Rado Harinivo'}</p>
                <p className="truncate text-label-sm font-label-sm text-on-surface-variant">Chef Logistique TNR</p>
              </div>
            </div>
            <button
              aria-label="Déconnexion"
              className="p-1 text-outline transition-colors hover:text-error"
              onClick={onLogout}
              title="Déconnexion"
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
