import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  DashboardStatCards,
  demoActivities,
  OperationalHubs,
  RecentActivityTable,
  ShipmentTrendChart,
  StatusDistribution,
} from '../components/dashboard/DashboardWidgets.jsx';

const periods = ["Aujourd'hui", 'Cette semaine', 'Ce mois'];
const agencyFilters = ['', 'Guangzhou', 'Toamasina', 'Antananarivo'];

function downloadDemoReport(rows) {
  const columns = ['Données de démonstration - non issues de la base', 'Code tracking', 'Client', 'Destination', 'Mode', 'Statut'];
  const lines = rows.map((row) => [row.code, row.client, row.destination, row.mode, row.status]);
  const csv = [columns, ...lines]
    .map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = 'corelink-rapport-demo.csv';
  anchor.click();
  URL.revokeObjectURL(href);
}

function ActionDialog({ activity, action, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activity) return null;

  return (
    <div className="corelink-admin-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section aria-labelledby="admin-demo-dialog-title" aria-modal="true" className="corelink-admin-modal" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-outline">Données de démonstration</p>
            <h2 className="mt-1 text-title-md font-title-md font-bold text-on-surface" id="admin-demo-dialog-title">{action}</h2>
          </div>
          <button aria-label="Fermer" className="rounded-lg p-1 text-outline hover:bg-surface-container-low hover:text-on-surface" onClick={onClose} type="button">
            <span aria-hidden="true" className="material-symbols-outlined">close</span>
          </button>
        </div>
        <dl className="mt-5 grid gap-3 text-body-sm">
          <div><dt className="font-semibold text-on-surface">Référence</dt><dd className="text-on-surface-variant">{activity.code}</dd></div>
          <div><dt className="font-semibold text-on-surface">Client</dt><dd className="text-on-surface-variant">{activity.client}</dd></div>
          <div><dt className="font-semibold text-on-surface">Statut</dt><dd className="text-on-surface-variant">{activity.status}</dd></div>
        </dl>
        <p className="mt-5 rounded-lg bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          Aucune opération réelle n’a été effectuée : le backend métier n’est pas encore connecté.
        </p>
        <div className="mt-5 flex justify-end">
          <button className="rounded-lg bg-secondary px-4 py-2 text-label-md font-label-md font-semibold text-on-secondary hover:bg-secondary-container" onClick={onClose} type="button">Fermer</button>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { searchTerm, onNotice } = useOutletContext();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(periods[0]);
  const [agencyIndex, setAgencyIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const agency = agencyFilters[agencyIndex];

  const exportRows = useMemo(() => demoActivities.filter((row) => (
    `${row.code} ${row.client} ${row.destination} ${row.status}`.toLocaleLowerCase('fr')
      .includes(searchTerm.toLocaleLowerCase('fr'))
  )), [searchTerm]);

  const handleAgencyFilter = () => {
    const nextIndex = (agencyIndex + 1) % agencyFilters.length;
    setAgencyIndex(nextIndex);
    onNotice(nextIndex ? `Filtre d’agence appliqué : ${agencyFilters[nextIndex]}. Données d’exemple uniquement.` : 'Filtre d’agence réinitialisé.');
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Accueil</span>
            <span aria-hidden="true" className="text-slate-400">/</span>
            <span aria-current="page" className="font-semibold text-slate-800">Tableau de bord</span>
          </nav>
          <h2 className="text-headline-md font-headline-md tracking-tight text-on-surface">Supervision &amp; Transit International</h2>
          <p className="mt-0.5 text-body-sm font-body-sm text-on-surface-variant">
            Corridor Chine (Guangzhou / Yiwu) ➔ Madagascar (Antananarivo / Toamasina). Données d’exemple, non reliées à une base.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div aria-label="Période du tableau de bord" className="inline-flex rounded-xl border border-outline-variant bg-surface-container-lowest p-0.5 text-label-md font-label-md shadow-xs" role="group">
            {periods.map((option) => (
              <button
                aria-pressed={period === option}
                className={`rounded-lg px-3 py-1.5 ${period === option ? 'bg-secondary font-semibold text-on-secondary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
                key={option}
                onClick={() => setPeriod(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md font-label-md text-on-surface shadow-xs transition-colors hover:bg-surface-container-low"
            onClick={() => {
              downloadDemoReport(exportRows);
              onNotice('Rapport CSV de démonstration téléchargé. Il contient uniquement les exemples affichés.');
            }}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">file_download</span>
            Exporter Rapport
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-label-md font-label-md font-semibold text-on-secondary shadow-sm transition-colors hover:bg-secondary-container"
            onClick={() => navigate('/admin/shipments')}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">local_shipping</span>
            Créer Expédition
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-label-sm font-label-sm text-amber-800" role="status">
        Tableau de bord en mode démonstration : les indicateurs, activités et statuts sont des exemples temporaires.
        {agency && <span className="ml-1 font-semibold">Agence filtrée : {agency}.</span>}
        <span className="ml-1">Période sélectionnée : {period}.</span>
      </div>

      <DashboardStatCards />

      <section aria-label="Analyses des expéditions" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ShipmentTrendChart />
        <StatusDistribution onFilter={handleAgencyFilter} />
      </section>

      <RecentActivityTable
        agencyFilter={agency}
        onExport={() => {
          downloadDemoReport(exportRows);
          onNotice('Rapport CSV de démonstration téléchargé. Il contient uniquement les exemples affichés.');
        }}
        onRowAction={(activity, action) => setSelectedActivity({ activity, action })}
        searchQuery={searchTerm}
      />

      <OperationalHubs />

      {selectedActivity && (
        <ActionDialog
          action={selectedActivity.action}
          activity={selectedActivity.activity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </>
  );
}
