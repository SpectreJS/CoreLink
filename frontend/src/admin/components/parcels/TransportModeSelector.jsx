import React from 'react';
import TransportBadge from './TransportBadge.jsx';

export default function TransportModeSelector({ modes, value, onChange }) {
  return (
    <fieldset className="rounded-xl border border-secondary/30 bg-surface-container-low p-4 md:col-span-2">
      <legend className="px-1 text-label-md font-semibold text-secondary">Mode de transport</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {modes.map((mode) => {
          const isSelected = value === mode.value;
          return (
            <button
              aria-pressed={isSelected}
              className={`rounded-lg border p-3 text-left transition-all ${isSelected ? 'border-secondary bg-blue-50 shadow-sm ring-1 ring-secondary/30' : 'border-outline-variant bg-surface-container-lowest hover:border-secondary'}`}
              key={mode.value}
              onClick={() => onChange(mode.value)}
              type="button"
            >
              <TransportBadge label={mode.label} value={mode.value} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
