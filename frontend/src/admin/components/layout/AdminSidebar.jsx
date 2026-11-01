import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
import { getAdminNavigationLinks } from '../../routes/permissions.js';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';

const links = [
  ['dashboard', 'Dashboard', 'dashboard'],
  ['parcels', 'Gestion des colis', 'inventory_2'],
  ['customers', 'Clients', 'groups'],
  ['tracking', 'Événements de suivi', 'route'],
  ['shipments', 'Expéditions', 'flight_takeoff'],
  ['payments', 'Paiements', 'payments'],
  ['reports', 'Rapports & analyses', 'monitoring'],
  ['users', 'Utilisateurs & rôles', 'manage_accounts'],
  ['settings', 'Paramètres', 'settings'],
];

export default function AdminSidebar({ open, onNavigate }) {
  const { user } = useAdminAuth();
  const visibleLinks = getAdminNavigationLinks(user?.role, links);
  return (
    <>
      {open && <button aria-label="Fermer le menu" className="admin-sidebar-overlay" onClick={onNavigate} type="button" />}
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <NavLink className="admin-sidebar-brand" onClick={onNavigate} to="/admin/dashboard">
          <img alt="" src={logo} />
          <span>CoreLink <small>ADMIN</small></span>
        </NavLink>
        <nav aria-label="Navigation administrative" className="admin-sidebar-nav">
          {visibleLinks.map(([path, label, icon]) => (
            <NavLink
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'is-active' : ''}`}
              end={path === 'dashboard'}
              key={path}
              onClick={onNavigate}
              to={`/admin/${path}`}
            >
              <span aria-hidden="true" className="material-symbols-outlined">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">Espace d’administration<br />CoreLink Sourcing &amp; Logistics</div>
      </aside>
    </>
  );
}
