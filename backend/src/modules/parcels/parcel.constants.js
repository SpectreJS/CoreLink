export const parcelStatuses = [
  { value: 'received', label: 'Réception Chine' },
  { value: 'air_transit', label: 'En transit aérien' },
  { value: 'sea_transit', label: 'En transit maritime' },
  { value: 'customs_clearance', label: 'Dédouanement Ivato' },
  { value: 'ready_for_pickup', label: 'Prêt au retrait' },
  { value: 'delivered', label: 'Livré au client' },
  { value: 'delayed', label: 'Retardé' },
];

export const parcelTransportModes = [
  { value: 'air_regular', label: 'Fret Aérien Régulier' },
  { value: 'air_express', label: 'Fret Aérien Express' },
  { value: 'sea_lcl', label: 'Fret Maritime LCL' },
];

export const parcelStatusValues = parcelStatuses.map(({ value }) => value);
export const parcelTransportModeValues = parcelTransportModes.map(({ value }) => value);
