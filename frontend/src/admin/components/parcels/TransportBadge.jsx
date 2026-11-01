import React from 'react';
import { Package, Plane, PlaneTakeoff, Ship } from 'lucide-react';

const transportBadgeConfig = {
  air_express: { icon: PlaneTakeoff, className: 'border-violet-200 bg-violet-50 text-violet-700' },
  air_regular: { icon: Plane, className: 'border-blue-200 bg-blue-50 text-blue-700' },
  sea_lcl: { icon: Ship, className: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
};

export default function TransportBadge({ value, label }) {
  const config = transportBadgeConfig[value] || {
    icon: Package,
    className: 'border-slate-200 bg-slate-50 text-slate-600',
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-label-sm font-semibold transition-colors hover:shadow-sm ${config.className}`}>
      <Icon aria-hidden="true" size={17} strokeWidth={2} />
      {label || value || 'Mode inconnu'}
    </span>
  );
}
