export const adminRouteConfig = [
  {
    path: '/admin',
    children: [
      { path: 'dashboard', handle: { label: 'Dashboard', to: '/admin/dashboard' } },
      {
        path: 'parcels',
        handle: { label: 'Gestion des colis', to: '/admin/parcels' },
        children: [
          { path: 'new', handle: { label: 'Nouveau colis' } },
          { path: ':id/edit', handle: { label: 'Modifier le colis' } },
          { path: ':id', handle: { label: 'Détails du colis' } },
        ],
      },
      {
        path: 'customers',
        handle: { label: 'Clients', to: '/admin/customers' },
        children: [
          { path: 'new', handle: { label: 'Nouveau client' } },
          { path: ':id/edit', handle: { label: 'Modifier le client' } },
          { path: ':id', handle: { label: 'Détails du client' } },
        ],
      },
      { path: 'tracking', handle: { label: 'Tarifs & devis', to: '/admin/tracking' } },
      {
        path: 'shipments',
        handle: { label: 'Expéditions', to: '/admin/shipments' },
        children: [{ path: ':id', handle: { label: 'Détails de l’expédition' } }],
      },
      { path: 'payments', handle: { label: 'Paiements', to: '/admin/payments' } },
      { path: 'reports', handle: { label: 'Rapports', to: '/admin/reports' } },
      { path: 'users', handle: { label: 'Utilisateurs', to: '/admin/users' } },
      { path: 'settings', handle: { label: 'Paramètres', to: '/admin/settings' } },
    ],
  },
];
