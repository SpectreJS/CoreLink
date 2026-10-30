import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const labels = {
  admin: 'Administration',
  dashboard: 'Dashboard',
  parcels: 'Colis',
  customers: 'Clients',
  tracking: 'Suivi',
  shipments: 'Expéditions',
  invoices: 'Factures',
  payments: 'Paiements',
  reports: 'Rapports',
  users: 'Utilisateurs',
  settings: 'Paramètres',
  new: 'Nouveau',
  edit: 'Modification',
};

export default function AdminBreadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return (
    <nav aria-label="Fil d’Ariane" className="admin-breadcrumb">
      {parts.map((part, index) => {
        const label = labels[part] || (index > 1 ? 'Détail' : part);
        const to = `/${parts.slice(0, index + 1).join('/')}`;
        return (
          <React.Fragment key={to}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === parts.length - 1
              ? <span className="is-current">{label}</span>
              : <Link to={to}>{label}</Link>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
