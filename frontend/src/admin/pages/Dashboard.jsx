import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  DashboardStatCards,
  RecentActivityTable,
  ShipmentTrendChart,
  StatusDistribution,
  TransportDistribution,
} from '../components/dashboard/DashboardWidgets.jsx';
import { getDashboard } from '../services/dashboardService.js';

const periods = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '3m', label: '3 mois' },
  { value: '12m', label: '12 mois' },
];
const emptyData = {
  stats: { total: 0, pending: 0, inTransit: 0, delivered: 0, delayed: 0, changePercent: null },
  trend: [], byStatus: [], byTransport: [], latest: [], statusLabels: {}, transportLabels: {},
};

function downloadReport(rows) {
  const headers = ['N° de série', 'N° de suivi', 'Description', 'Client', 'Origine', 'Destination', 'Transport', 'Statut'];
  const lines = rows.map((row) => [row.serialNumber, row.trackingNumber, row.description, row.customerName, row.origin, row.destination, row.transportMode, row.status]);
  const csv = [headers, ...lines].map((line) => line.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'corelink-dashboard.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { onNotice } = useOutletContext();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('7d');
  const [dashboard, setDashboard] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getDashboard(period);
      if (!result?.data) throw new Error('Réponse Dashboard invalide.');
      setDashboard(result.data);
    } catch (loadError) {
      setDashboard(emptyData);
      setError(loadError.message || 'Impossible de charger le Dashboard.');
    } finally {
      setLoading(false);
    }
  }, [period]);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div><h2 className="text-headline-md tracking-tight text-on-surface">Supervision &amp; Transit International</h2><p className="mt-0.5 text-body-sm text-on-surface-variant">Activité logistique réelle des colis enregistrés dans CoreLink.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <div aria-label="Période du tableau de bord" className="inline-flex rounded-xl border border-outline-variant bg-surface-container-lowest p-0.5 text-label-md shadow-xs" role="group">
            {periods.map((option) => <button aria-pressed={period === option.value} className={`rounded-lg px-3 py-1.5 ${period === option.value ? 'bg-secondary font-semibold text-on-secondary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} key={option.value} onClick={() => setPeriod(option.value)} type="button">{option.label}</button>)}
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface shadow-xs" onClick={() => downloadReport(dashboard.latest)} type="button"><span className="material-symbols-outlined text-base">file_download</span>Exporter Rapport</button>
          <button className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-label-md font-semibold text-on-secondary shadow-sm" onClick={() => navigate('/admin/parcels')} type="button"><span className="material-symbols-outlined text-base">local_shipping</span>Voir les colis</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-label-sm text-red-800" role="alert">{error}</div>}
      <DashboardStatCards loading={loading} stats={dashboard.stats} />
      <section aria-label="Analyses des colis" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ShipmentTrendChart data={dashboard.trend} loading={loading} />
        <StatusDistribution data={dashboard.byStatus} labels={dashboard.statusLabels} loading={loading} />
      </section>
      <TransportDistribution data={dashboard.byTransport} labels={dashboard.transportLabels} loading={loading} />
      <RecentActivityTable onView={(row) => navigate(`/admin/parcels/${row.id}`)} rows={dashboard.latest} statusLabels={dashboard.statusLabels} transportLabels={dashboard.transportLabels} />
      <div className="flex justify-end"><button className="rounded-lg border border-outline-variant px-4 py-2 text-label-md font-semibold text-secondary" onClick={() => { onNotice('Liste des colis ouverte.'); navigate('/admin/parcels'); }} type="button">Voir tous les colis</button></div>
    </div>
  );
}
