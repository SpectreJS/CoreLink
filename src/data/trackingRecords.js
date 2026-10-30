export const trackingRecords = [
  {
    trackingNumber: 'CL-2026-00125',
    reference: 'DEMO-2026-00125',
    status: 'En transit',
    origin: 'Guangzhou (CAN)',
    destination: 'Antananarivo (TNR)',
    updatedAt: '30 octobre 2026 · 09:30 UTC+3',
    estimatedDelivery: '4 novembre 2026',
    freightType: 'Transport aérien express',
    weight: 'Donnée de démonstration',
    currentHub: 'Transit international',
    progress: 62,
    publicTracking: true,
    events: [
      {
        status: 'En transit international',
        location: 'Corridor Guangzhou – Antananarivo',
        date: '30 octobre 2026 · 09:30',
      },
      {
        status: 'Colis expédié',
        location: 'Guangzhou (CAN)',
        date: '28 octobre 2026 · 16:10',
      },
      {
        status: 'Colis enregistré',
        location: 'Centre logistique de Guangzhou',
        date: '26 octobre 2026 · 11:20',
      },
    ],
  },
  {
    trackingNumber: 'CL123456789',
    reference: 'DEMO-CL123456789',
    status: 'En préparation',
    origin: 'Guangzhou (CAN)',
    destination: 'Antananarivo (TNR)',
    updatedAt: '29 octobre 2026 · 14:15 UTC+3',
    estimatedDelivery: 'À confirmer',
    freightType: 'Transport aérien express',
    weight: 'Donnée de démonstration',
    currentHub: 'Centre logistique de Guangzhou',
    progress: 25,
    publicTracking: true,
    events: [
      {
        status: 'Préparation de l’expédition',
        location: 'Centre logistique de Guangzhou',
        date: '29 octobre 2026 · 14:15',
      },
      {
        status: 'Colis enregistré',
        location: 'Guangzhou (CAN)',
        date: '27 octobre 2026 · 10:00',
      },
    ],
  },
];
