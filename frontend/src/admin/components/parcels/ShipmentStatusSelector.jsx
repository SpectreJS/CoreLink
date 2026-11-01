import React from 'react';
import { getShipmentStatusConfig } from './shipmentStatusConfig.js';

export default function ShipmentStatusSelector({ statuses, value, previousValue, onChange }) {
  const previous = statuses.find((status) => status.value === previousValue);
  const selected = statuses.find((status) => status.value === value);
  return (
    <fieldset className="rounded-xl border border-secondary/30 bg-surface-container-low p-4 md:col-span-2">
      <legend className="px-1 text-label-md font-semibold text-secondary">Statut opérationnel</legend>
      {previous && selected && previous.value !== selected.value && (
        <p className="mb-3 text-body-sm text-on-surface-variant">
          Statut actuel : <strong>{previous.label}</strong> → Nouveau statut : <strong>{selected.label}</strong>
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {statuses.map((status) => {
          const config = getShipmentStatusConfig(status.value);
          const isSelected = value === status.value;
          return (
            <button
              aria-pressed={isSelected}
              className={`rounded-lg border p-3 text-center transition-all ${isSelected ? `shipment-status-option is-${config.tone} is-selected` : 'border-outline-variant bg-surface-container-lowest hover:border-secondary'}`}
              key={status.value}
              onClick={() => onChange(status.value)}
              type="button"
            >
              <span aria-hidden="true" className="material-symbols-outlined block text-xl">{config.icon}</span>
              <span className="mt-1 block text-label-sm font-semibold">{status.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
