export const DEMO_DASHBOARD_STATS = [
  { label: 'Colis enregistrés', value: '128', change: '+12 ce mois', icon: 'inventory_2', tone: 'blue' },
  { label: 'En transit', value: '46', change: 'Données fictives', icon: 'flight', tone: 'cyan' },
  { label: 'Clients', value: '84', change: 'Exemples uniquement', icon: 'groups', tone: 'violet' },
  { label: 'Factures en attente', value: '12', change: 'Données fictives', icon: 'receipt_long', tone: 'amber' },
];

export const DEMO_PARCELS = [
  { tracking: 'CL-DEMO-001', customer: 'Client de démonstration A', destination: 'Antananarivo', status: 'En transit', updated: 'Aujourd’hui' },
  { tracking: 'CL-DEMO-002', customer: 'Client de démonstration B', destination: 'Toamasina', status: 'En préparation', updated: 'Hier' },
  { tracking: 'CL-DEMO-003', customer: 'Client de démonstration C', destination: 'Antananarivo', status: 'Livré', updated: '28 oct. 2026' },
];

export const DEMO_CUSTOMERS = [
  { name: 'Client de démonstration A', email: 'client-a@example.test', parcels: 3, status: 'Actif' },
  { name: 'Client de démonstration B', email: 'client-b@example.test', parcels: 1, status: 'Actif' },
  { name: 'Client de démonstration C', email: 'client-c@example.test', parcels: 0, status: 'À vérifier' },
];
