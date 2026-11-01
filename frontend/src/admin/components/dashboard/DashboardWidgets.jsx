import React, { useMemo, useState } from 'react';

const statCards = [
  { label: 'Total Colis', value: '1 428', icon: 'package_2', iconTone: 'text-secondary', subIcon: 'trending_up', subValue: '+12.4%', subText: 'ce mois', progress: '100%', progressTone: 'bg-secondary', positive: true },
  { label: 'Entrepôts Chine', value: '84', icon: 'warehouse', iconTone: 'text-blue-600', detail: <>Guangzhou: <strong className="font-semibold text-on-surface">62</strong> • Yiwu: <strong className="font-semibold text-on-surface">22</strong></>, progress: '28%', progressTone: 'bg-blue-600' },
  { label: 'En Transit Fret', value: '342', icon: 'sync_alt', iconTone: 'text-cyan-600', detail: <>Aérien: <strong className="font-semibold text-on-surface">114</strong> • Maritime: <strong className="font-semibold text-on-surface">228</strong></>, progress: '58%', progressTone: 'bg-cyan-500' },
  { label: 'Arrivés Madagascar', value: '56', icon: 'gavel', iconTone: 'text-amber-600', detail: 'Ivato TNR & Tamatave', detailTone: 'text-amber-700 font-semibold', progress: '38%', progressTone: 'bg-amber-500' },
  { label: 'Livrés & Clôturés', value: '898', icon: 'verified', iconTone: 'text-green-600', subIcon: 'check_circle', subValue: '99.2%', subText: 'succès', progress: '92%', progressTone: 'bg-green-600', positive: true },
  { label: 'Anomalies / Retards', value: '4', icon: 'warning', iconTone: 'text-error', alert: true, subIcon: 'error', subValue: 'Action requise douane', progress: '14%', progressTone: 'bg-error' },
];

export function DashboardStatCards() {
  return (
    <section aria-label="Indicateurs clés" className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
      {statCards.map((stat) => (
        <article
          className={`rounded-xl border p-4 shadow-xs transition-all hover:border-secondary ${
            stat.alert
              ? 'border-red-200 bg-red-50/20'
              : 'border-outline-variant/80 bg-surface-container-lowest'
          }`}
          key={stat.label}
        >
          <div className={`flex items-center justify-between text-label-sm font-label-sm font-semibold uppercase ${
            stat.alert ? 'text-error' : 'text-outline'
          }`}
          >
            <span>{stat.label}</span>
            <span aria-hidden="true" className={`material-symbols-outlined ${stat.iconTone}`}>{stat.icon}</span>
          </div>
          <div className="mt-3">
            <div className={`text-headline-md font-headline-md font-bold ${stat.alert ? 'text-error' : 'text-on-surface'}`}>{stat.value}</div>
            {stat.detail && (
              <div className={`mt-1 truncate text-label-sm font-label-sm text-on-surface-variant ${stat.detailTone || ''}`}>
                {stat.detail}
              </div>
            )}
            {stat.subValue && (
              <div className={`mt-1 flex items-center gap-1 text-label-sm font-label-sm font-semibold ${
                stat.alert ? 'text-error' : stat.positive ? 'text-on-tertiary-container' : 'text-on-surface-variant'
              }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-xs">{stat.subIcon}</span>
                <span>{stat.subValue}</span>
                {stat.subText && <span className="font-normal text-on-surface-variant">{stat.subText}</span>}
              </div>
            )}
          </div>
          <div className={`mt-3 h-1 w-full rounded-full ${stat.alert ? 'bg-red-100' : 'bg-surface-container'}`}>
            <div className={`h-1 rounded-full ${stat.progressTone}`} style={{ width: stat.progress }} />
          </div>
        </article>
      ))}
    </section>
  );
}

export function ShipmentTrendChart() {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-outline-variant/80 bg-surface-container-lowest p-5 shadow-xs lg:col-span-8">
      <div>
        <div className="flex flex-col justify-between gap-3 border-b border-outline-variant/40 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-title-md font-title-md font-bold text-on-surface">Flux des Expéditions Mensuelles (Tonnage &amp; Volumétrie)</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Comparaison fret express aérien (avion) vs fret conteneur maritime (bateau)</p>
          </div>
          <div className="flex items-center gap-4 text-label-sm font-label-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-secondary" />
              <span className="font-medium text-on-surface">Fret Aérien Express</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-cyan-500" />
              <span className="font-medium text-on-surface">Fret Maritime LCL/FCL</span>
            </div>
          </div>
        </div>
        <div className="pb-2 pt-6">
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex flex-col justify-between font-mono text-[11px] text-outline">
              <div className="flex w-full justify-between border-b border-outline-variant/30"><span>500 T</span><span className="text-[10px] text-outline">Capacité Max Hub</span></div>
              <div className="w-full border-b border-outline-variant/30">375 T</div>
              <div className="w-full border-b border-outline-variant/30">250 T</div>
              <div className="w-full border-b border-outline-variant/30">125 T</div>
              <div className="w-full border-b border-outline-variant/60">0 T</div>
            </div>
            <svg aria-label="Courbes de tonnage aérien et maritime, données d’exemple" className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" role="img" viewBox="0 0 700 240">
              <defs>
                <linearGradient id="gradAir" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0051d5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0051d5" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gradSea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M 0,180 Q 70,160 140,150 T 280,120 T 420,90 T 560,70 T 700,50 L 700,240 L 0,240 Z" fill="url(#gradSea)" />
              <path d="M 0,180 Q 70,160 140,150 T 280,120 T 420,90 T 560,70 T 700,50" fill="none" stroke="#06b6d4" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M 0,200 Q 70,185 140,170 T 280,140 T 420,110 T 560,100 T 700,85 L 700,240 L 0,240 Z" fill="url(#gradAir)" />
              <path d="M 0,200 Q 70,185 140,170 T 280,140 T 420,110 T 560,100 T 700,85" fill="none" stroke="#0051d5" strokeLinecap="round" strokeWidth="3" />
              <circle cx="420" cy="90" fill="#06b6d4" r="4.5" stroke="white" strokeWidth="2" />
              <circle cx="420" cy="110" fill="#0051d5" r="5" stroke="white" strokeWidth="2" />
              <circle cx="700" cy="50" fill="#06b6d4" r="4.5" stroke="white" strokeWidth="2" />
              <circle cx="700" cy="85" fill="#0051d5" r="5" stroke="white" strokeWidth="2" />
            </svg>
            <div className="pointer-events-none absolute left-[60%] top-6 -translate-x-1/2 rounded-lg border border-outline-variant/20 bg-primary-container px-3 py-2 text-label-xs text-white shadow-lg">
              <div className="text-[11px] font-bold text-primary-fixed">Octobre 2024</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span className="text-cyan-300">Maritime: 380 T</span>
                <span className="text-blue-300">Aérien: 290 T</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between px-2 pt-3 text-label-sm font-label-sm text-outline">
            {['Mai', 'Juin', 'Juil', 'Août', 'Sept'].map((month) => <span key={month}>{month}</span>)}
            <span className="font-bold text-secondary">Oct (En cours)</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-3 text-body-sm font-body-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-secondary">route</span>
          <span className="font-semibold text-on-surface">Corridor Principal :</span>
          <span className="text-on-surface-variant">Guangzhou Baiyun (CAN) ➔ Port Tamatave / Ivato TNR</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label-sm font-label-sm text-outline">Délai moyen Aérien : <strong className="text-on-surface">5-7j</strong></span>
          <span className="text-outline">•</span>
          <span className="text-label-sm font-label-sm text-outline">Délai Maritime : <strong className="text-on-surface">25-35j</strong></span>
        </div>
      </div>
    </section>
  );
}

const distribution = [
  { name: 'Entrepôts Chine (GZ / YIWU)', description: 'Réception & consolidation', count: '214', percent: '15%', color: 'bg-blue-500' },
  { name: 'En Vol (Fret Aérien)', description: 'Lignes CAN-TNR via Nairobi/Addis', count: '357', percent: '25%', color: 'bg-indigo-600' },
  { name: 'En Mer (Fret Maritime)', description: 'Conteneurs en mer indienne', count: '571', percent: '40%', color: 'bg-cyan-500' },
  { name: 'Dédouanement Ivato / Tamatave', description: 'Inspection & déclarations DAU', count: '143', percent: '10%', color: 'bg-amber-500' },
  { name: 'Livrés & Prêts à Behintsy', description: 'Agences Antananarivo centre', count: '143', percent: '10%', color: 'bg-emerald-500' },
];

export function StatusDistribution({ onFilter }) {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-outline-variant/80 bg-surface-container-lowest p-5 shadow-xs lg:col-span-4">
      <div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <h3 className="text-title-md font-title-md font-bold text-on-surface">Distribution du Parc</h3>
          <span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-label-sm font-semibold text-on-surface-variant">Temps réel</span>
        </div>
        <div aria-label="Répartition des colis par statut, données d’exemple" className="my-5 flex h-3 w-full overflow-hidden rounded-full bg-surface-container" role="img">
          <div className="bg-blue-500" style={{ width: '15%' }} title="Entrepôt Chine 15%" />
          <div className="bg-indigo-600" style={{ width: '25%' }} title="En vol Aérien 25%" />
          <div className="bg-cyan-500" style={{ width: '40%' }} title="En mer Maritime 40%" />
          <div className="bg-amber-500" style={{ width: '10%' }} title="Dédouanement 10%" />
          <div className="bg-emerald-500" style={{ width: '10%' }} title="Livré & Clôturé 10%" />
        </div>
        <div className="space-y-3">
          {distribution.map((item) => (
            <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-container-low" key={item.name}>
              <div className="flex items-center gap-2.5">
                <span className={`h-3 w-3 shrink-0 rounded-full ${item.color}`} />
                <div>
                  <p className="text-label-md font-label-md font-semibold text-on-surface">{item.name}</p>
                  <p className="text-label-sm font-label-sm text-outline">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-title-sm font-title-sm font-bold text-on-surface">{item.count}</span>
                <span className="block text-label-sm font-label-sm text-outline">{item.percent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-outline-variant/40 pt-3">
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low py-2 text-label-md font-label-md font-semibold text-secondary transition-colors hover:bg-surface-container"
          onClick={onFilter}
          type="button"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">filter_alt</span>
          Filtrer les volumes par agence
        </button>
      </div>
    </section>
  );
}

export const demoActivities = [
  {
    code: 'CL-2025-8842', reference: 'Bordereau #GZ-9912', client: 'Société Madagascar High-Tech SARL',
    phone: '+261 34 12 458 90 • Antananarivo', destination: 'Antananarivo (Ivato)', hub: 'Hub TNR Central',
    mode: 'Aérien Express', modeIcon: 'flight', weight: '42.5 kg • 0.38 m³', status: 'Dédouanement Ivato',
    statusColor: 'amber', updated: "Aujourd'hui, 08:30", note: 'Contrôle documentaire DAU', iconColor: 'text-secondary',
  },
  {
    code: 'CL-2025-8839', reference: 'Conteneur #MSK-40112', client: 'Tsena Be Sourcing Bazar',
    phone: '+261 33 08 771 22 • Toamasina', destination: 'Toamasina (Grand Port)', hub: 'Terminal Maritime',
    mode: 'Maritime LCL', modeIcon: 'sailing', weight: '320.0 kg • 2.45 m³', status: 'En Mer (Océan Indien)',
    statusColor: 'blue', updated: 'Hier, 22:15', note: 'Passage détroit Malacca', iconColor: 'text-cyan-600',
  },
  {
    code: 'CL-2025-8835', reference: 'Entrepôt Baiyun-A4', client: 'Kanto Boutique & Mode',
    phone: '+261 32 99 112 04 • Behintsy', destination: 'Antananarivo (Behintsy)', hub: 'Dépôt Retrait Client',
    mode: 'Aérien Express', modeIcon: 'flight', weight: '18.2 kg • 0.12 m³', status: 'Réception Guangzhou',
    statusColor: 'indigo', updated: "Aujourd'hui, 04:10", note: 'Pesée & étiquetage QR validés', iconColor: 'text-indigo-600',
  },
  {
    code: 'CL-2025-8820', reference: 'BL-2025-0199', client: 'Omnium Import Distribution',
    phone: '+261 20 22 410 88 • Ankorondrano', destination: 'Antananarivo (Livré)', hub: 'Livraison sur site client',
    mode: 'Maritime FCL', modeIcon: 'sailing', weight: '1 850.0 kg • 12.0 m³', status: 'Livré & Clôturé',
    statusColor: 'emerald', updated: 'Hier, 16:40', note: 'Signé par M. Andry R.', iconColor: 'text-emerald-600',
  },
  {
    code: 'CL-2025-8814', reference: "Avis d'inspection #DOU-44", client: 'Pharma-Tech Madagascar',
    phone: '+261 34 00 231 15 • Ivandry', destination: 'Antananarivo (Ivato)', hub: 'Zone Fret Sous Douane',
    mode: 'Aérien Express', modeIcon: 'flight', weight: '12.0 kg • 0.08 m³', status: 'Blocage / Facture Requise',
    statusColor: 'red', updated: 'Il y a 2 heures', note: 'Notification client transmise', iconColor: 'text-error', urgent: true,
  },
];

const statusClassNames = {
  amber: 'border-amber-300 bg-amber-50 text-amber-800',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  red: 'border-red-200 bg-red-50 text-red-700',
};

const dotClassNames = {
  amber: 'bg-amber-600 animate-ping',
  blue: 'bg-blue-600',
  indigo: 'bg-indigo-600',
  emerald: 'bg-emerald-600',
  red: 'bg-error',
};

export function RecentActivityTable({ searchQuery, agencyFilter, onRowAction, onExport }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const rows = useMemo(() => demoActivities.filter((row) => {
    const matchesSearch = `${row.code} ${row.reference} ${row.client} ${row.phone} ${row.destination} ${row.mode} ${row.status}`
      .toLocaleLowerCase('fr')
      .includes(searchQuery.toLocaleLowerCase('fr'));
    const matchesStatus = !statusFilter || row.status.toLocaleLowerCase('fr').includes(statusFilter.toLocaleLowerCase('fr'));
    const matchesDestination = !destinationFilter || row.destination.toLocaleLowerCase('fr').includes(destinationFilter.toLocaleLowerCase('fr'));
    const matchesAgency = !agencyFilter || `${row.hub} ${row.destination}`.toLocaleLowerCase('fr').includes(agencyFilter.toLocaleLowerCase('fr'));
    return matchesSearch && matchesStatus && matchesDestination && matchesAgency;
  }), [agencyFilter, destinationFilter, searchQuery, statusFilter]);

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/80 bg-surface-container-lowest shadow-xs">
      <div className="flex flex-col justify-between gap-4 border-b border-outline-variant p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-title-md font-title-md font-bold text-on-surface">Activité Récente des Colis &amp; Expéditions</h3>
            <span className="rounded-full bg-secondary-fixed px-2 py-0.5 text-label-sm font-label-sm font-bold text-on-secondary-fixed-variant">Flux continu</span>
          </div>
          <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">Derniers colis enregistrés, réceptions entrepôt Chine et sorties douanières Madagascar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="relative">
            <span className="sr-only">Filtrer par statut</span>
            <span aria-hidden="true" className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-outline">filter_list</span>
            <select className="rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-8 pr-7 text-body-sm font-body-sm text-on-surface focus:border-secondary focus:outline-none" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">Tous les statuts</option>
              <option value="Transit">En Transit</option>
              <option value="Dédouanement">En Dédouanement</option>
              <option value="Guangzhou">Arrivé au Hub</option>
              <option value="Livré">Livré</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrer par destination</span>
            <select className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-body-sm font-body-sm text-on-surface focus:border-secondary focus:outline-none" onChange={(event) => setDestinationFilter(event.target.value)} value={destinationFilter}>
              <option value="">Toutes destinations (TNR / TMM)</option>
              <option value="Antananarivo">Antananarivo (Ivato/Behintsy)</option>
              <option value="Toamasina">Toamasina (Port)</option>
            </select>
          </label>
          <button
            aria-label="Réinitialiser les filtres des données de démonstration"
            className="rounded-lg border border-outline-variant bg-surface-container-low p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            onClick={() => { setStatusFilter(''); setDestinationFilter(''); }}
            title="Réinitialiser les filtres de démonstration"
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">refresh</span>
          </button>
          <button className="rounded-lg border border-outline-variant bg-surface-container-low px-2 py-1.5 text-label-sm font-label-sm font-semibold text-on-surface-variant hover:bg-surface-container" onClick={onExport} type="button">
            Exporter l’exemple
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/70 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
              {['Code Tracking', 'Client & Contact', 'Destination Hub', 'Mode & Poids', 'Statut Opérationnel', 'Dernière Mise à Jour', 'Actions'].map((heading) => (
                <th className={`px-4 py-3 font-semibold ${heading === 'Actions' ? 'text-right' : ''}`} key={heading} scope="col">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm">
            {rows.map((row) => (
              <tr className={`transition-colors hover:bg-surface-container-low/40 ${row.urgent ? 'bg-red-50/10 hover:bg-red-50/30' : ''}`} key={row.code}>
                <td className="px-4 py-3.5 font-semibold">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className={`material-symbols-outlined text-base ${row.iconColor}`}>{row.urgent ? 'warning' : 'qr_code'}</span>
                    <button className={`font-code-tracking text-code-tracking font-bold hover:underline ${row.urgent ? 'text-error' : 'text-secondary'}`} onClick={() => onRowAction(row, 'Détail de traçabilité')} type="button">{row.code}</button>
                  </div>
                  <span className={`block pl-6 text-[11px] ${row.urgent ? 'font-medium text-error' : 'text-outline'}`}>{row.reference}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-on-surface">{row.client}</div>
                  <div className="text-label-sm font-label-sm text-outline">{row.phone}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span aria-hidden="true" className="material-symbols-outlined text-sm text-outline">{row.modeIcon === 'sailing' ? 'directions_boat' : 'location_on'}</span>
                    <span>{row.destination}</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-outline">{row.hub}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-on-surface">
                    <span aria-hidden="true" className={`material-symbols-outlined text-sm ${row.modeIcon === 'sailing' ? 'text-cyan-600' : 'text-blue-600'}`}>{row.modeIcon}</span>
                    <span>{row.mode}</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-outline">{row.weight}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-md font-label-md font-semibold ${statusClassNames[row.statusColor]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${dotClassNames[row.statusColor]}`} />
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-on-surface-variant">
                  <span className={`font-medium ${row.urgent ? 'text-error' : 'text-on-surface'}`}>{row.updated}</span>
                  <span className="block text-label-sm font-label-sm text-outline">{row.note}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button aria-label={`Voir ${row.code}`} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-secondary" onClick={() => onRowAction(row, 'Détail de traçabilité')} title="Voir traçabilité détaillée" type="button">
                      <span aria-hidden="true" className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button aria-label={`Imprimer la référence ${row.code}`} className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-secondary" onClick={() => onRowAction(row, 'Impression')} title="Imprimer étiquette" type="button">
                      <span aria-hidden="true" className="material-symbols-outlined text-lg">print</span>
                    </button>
                    {row.urgent ? (
                      <button className="rounded bg-error px-2.5 py-1 text-label-sm font-label-sm font-semibold text-white shadow-xs transition-colors hover:bg-red-700" onClick={() => onRowAction(row, 'Régularisation')} type="button">Régulariser</button>
                    ) : (
                      <button aria-label={`Plus d’actions pour ${row.code}`} className="rounded-lg p-1.5 text-outline hover:bg-surface-container hover:text-on-surface" onClick={() => onRowAction(row, 'Actions supplémentaires')} title="Plus d’actions" type="button">
                        <span aria-hidden="true" className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="px-4 py-8 text-center text-on-surface-variant" colSpan="7">Aucun colis d’exemple ne correspond aux filtres.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant/60 p-4 text-body-sm font-body-sm text-on-surface-variant sm:flex-row">
        <div className="text-label-sm font-label-sm">
          Affichage de <span className="font-semibold text-on-surface">{rows.length ? 1 : 0}</span> à <span className="font-semibold text-on-surface">{rows.length}</span> sur <span className="font-semibold text-on-surface">1 428</span> colis actifs — échantillon de démonstration
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface opacity-50" disabled type="button">Précédent</button>
          <button aria-current="page" className="rounded-lg bg-secondary px-3 py-1.5 text-label-md font-label-md font-semibold text-on-secondary shadow-xs" type="button">1</button>
          <button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface" disabled type="button">2</button>
          <button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface" disabled type="button">3</button>
          <span className="px-2 text-outline">...</span>
          <button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface" disabled type="button">286</button>
          <button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface opacity-50" disabled type="button">Suivant</button>
        </div>
      </div>
    </section>
  );
}

const hubs = [
  {
    icon: 'hub', iconStyle: 'border-blue-200 bg-blue-50 text-blue-700',
    title: 'Hub Chine — Guangzhou', status: 'Opérationnel', statusStyle: 'border-green-200 bg-green-50 text-green-700',
    description: 'Entrepôt Baiyun District. Prochain départ cargo aérien dans 4h 30m.',
  },
  {
    icon: 'anchor', iconStyle: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    title: 'Hub Maritime — Toamasina', status: 'Fluide', statusStyle: 'border-green-200 bg-green-50 text-green-700',
    description: "Terminal conteneurs MICTSL. Navire CMA CGM en cours d'accostage.",
  },
  {
    icon: 'apartment', iconStyle: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    title: 'Hub Central — Behintsy TNR', status: 'Affluence Haute', statusStyle: 'border-amber-200 bg-amber-50 text-amber-700',
    description: 'Point retrait client & dispatch local. 3 guichets de distribution ouverts.',
  },
];

export function OperationalHubs() {
  return (
    <section aria-label="État des hubs opérationnels" className="grid grid-cols-1 gap-4 pb-6 md:grid-cols-3">
      {hubs.map((hub) => (
        <article className="flex items-start gap-3.5 rounded-xl border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-xs" key={hub.title}>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${hub.iconStyle}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">{hub.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-title-sm font-title-sm font-bold text-on-surface">{hub.title}</h4>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold ${hub.statusStyle}`}>
                {hub.status}
              </span>
            </div>
            <p className="mt-0.5 text-body-sm font-body-sm text-outline">{hub.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
