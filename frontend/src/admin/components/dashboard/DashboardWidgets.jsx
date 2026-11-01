import React, { useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package, Plane, PlaneTakeoff, Ship } from 'lucide-react';
import { getShipmentStatusConfig } from '../parcels/shipmentStatusConfig.js';
const theme = createTheme({
  palette: { primary: { main: '#0051d5' }, background: { default: '#f8f9ff', paper: '#fff' } },
  typography: { fontFamily: 'Inter, sans-serif', fontSize: 13 },
  shape: { borderRadius: 8 },
});
const statusColors = ['#64748b', '#0051d5', '#06b6d4', '#f59e0b', '#16a34a', '#ef4444', '#7c3aed'];
const transportColors = ['#0051d5', '#06b6d4', '#7c3aed'];
const transportBadgeConfig = {
  air_express: { icon: PlaneTakeoff, className: 'border-violet-200 bg-violet-50 text-violet-700' },
  air_regular: { icon: Plane, className: 'border-blue-200 bg-blue-50 text-blue-700' },
  sea_lcl: { icon: Ship, className: 'border-cyan-200 bg-cyan-50 text-cyan-700' },
};
const statusBadgeClasses = {
  received: 'border-slate-200 bg-slate-50 text-slate-700',
  air_transit: 'border-blue-200 bg-blue-50 text-blue-700',
  sea_transit: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  customs_clearance: 'border-amber-200 bg-amber-50 text-amber-800',
  ready_for_pickup: 'border-violet-200 bg-violet-50 text-violet-700',
  delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  delayed: 'border-red-200 bg-red-50 text-red-700',
};

function initials(value) {
  return String(value || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function Card({ children, className = '' }) {
  return <section className={`rounded-xl border border-outline-variant/80 bg-surface-container-lowest p-5 shadow-xs ${className}`}>{children}</section>;
}

export function DashboardStatCards({ stats, loading }) {
  const cards = [
    ['Total colis', stats.total, 'package_2', 'text-secondary'],
    ['Colis en attente', stats.pending, 'schedule', 'text-slate-600'],
    ['Colis en transit', stats.inTransit, 'sync_alt', 'text-cyan-600'],
    ['Colis livrés', stats.delivered, 'verified', 'text-green-600'],
    ['Retards / anomalies', stats.delayed, 'warning', 'text-error'],
  ];
  return <section aria-label="Indicateurs clés" className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
    {cards.map(([label, value, icon, tone]) => (
      <article className="rounded-xl border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-xs" key={label}>
        <div className="flex items-center justify-between text-label-sm font-semibold uppercase text-outline"><span>{label}</span><span className={`material-symbols-outlined ${tone}`}>{icon}</span></div>
        <div className="mt-3 text-headline-md font-bold text-on-surface">{loading ? '…' : value.toLocaleString('fr-FR')}</div>
        {label === 'Total colis' && stats.changePercent !== null && <div className="mt-1 text-label-sm text-on-surface-variant">{stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}% vs période précédente</div>}
      </article>
    ))}
  </section>;
}

export function ShipmentTrendChart({ data, loading }) {
  return <Card className="lg:col-span-8">
    <div className="border-b border-outline-variant/40 pb-4"><h3 className="text-title-md font-bold text-on-surface">Évolution des colis enregistrés</h3><p className="text-body-sm text-on-surface-variant">Volume réel des colis créés pendant la période sélectionnée.</p></div>
    <div className="h-64 pt-5">
      {loading ? <p className="p-8 text-center text-on-surface-variant">Chargement…</p> : !data.length ? <p className="p-8 text-center text-on-surface-variant">Aucun colis sur cette période.</p> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Area dataKey="value" name="Colis" type="monotone" stroke="#0051d5" fill="#0051d5" fillOpacity={0.18} /></AreaChart></ResponsiveContainer>}
    </div>
  </Card>;
}

export function StatusDistribution({ data, labels, loading }) {
  const chartData = data.map((item) => ({ ...item, name: labels[item.key] || item.key }));
  return <Card className="lg:col-span-4"><h3 className="text-title-md font-bold text-on-surface">Répartition par statut</h3><p className="text-body-sm text-on-surface-variant">Statuts réellement enregistrés.</p><div className="h-64 pt-4">{loading ? <p className="p-8 text-center text-on-surface-variant">Chargement…</p> : !chartData.length ? <p className="p-8 text-center text-on-surface-variant">Aucun colis.</p> : <ResponsiveContainer><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={48} outerRadius={78}>{chartData.map((item, index) => <Cell fill={statusColors[index % statusColors.length]} key={item.key} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer>}</div></Card>;
}

export function TransportDistribution({ data, labels, loading }) {
  const chartData = data.map((item) => ({ ...item, name: labels[item.key] || item.key }));
  return <Card><h3 className="text-title-md font-bold text-on-surface">Répartition par mode de transport</h3><p className="text-body-sm text-on-surface-variant">Modes présents dans les colis enregistrés.</p><div className="h-64 pt-5">{loading ? <p className="p-8 text-center text-on-surface-variant">Chargement…</p> : !chartData.length ? <p className="p-8 text-center text-on-surface-variant">Aucun colis.</p> : <ResponsiveContainer><BarChart data={chartData}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" name="Colis" fill="#0051d5">{chartData.map((item, index) => <Cell fill={transportColors[index % transportColors.length]} key={item.key} />)}</Bar></BarChart></ResponsiveContainer>}</div></Card>;
}

export function RecentActivityTable({ rows, statusLabels, transportLabels, onView }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const columns = useMemo(() => [
    {
      accessorKey: 'serialNumber',
      header: 'N° de colis',
      size: 145,
      Cell: ({ cell }) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 font-mono text-label-sm font-bold text-secondary">
          <span aria-hidden="true" className="material-symbols-outlined text-base">package_2</span>
          {cell.getValue() || '—'}
        </span>
      ),
    },
    { accessorKey: 'trackingNumber', header: 'N° de suivi', size: 140, Cell: ({ cell }) => <span className="font-mono text-label-sm text-on-surface-variant">{cell.getValue() || '—'}</span> },
    { accessorKey: 'description', header: 'Description', size: 210, Cell: ({ cell }) => <span className="font-medium text-on-surface">{cell.getValue() || '—'}</span> },
    {
      accessorKey: 'customerName',
      header: 'Client',
      size: 190,
      Cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-sm font-bold text-white">{initials(row.original.customerName)}</span>
          <span className="min-w-0">
            <strong className="block truncate text-label-md text-on-surface">{row.original.customerName || '—'}</strong>
            {row.original.phone && <span className="block truncate text-label-sm text-outline">{row.original.phone}</span>}
          </span>
        </div>
      ),
    },
    { accessorKey: 'origin', header: 'Origine', size: 140, Cell: ({ cell }) => <span className="text-body-sm text-on-surface-variant">{cell.getValue() || '—'}</span> },
    {
      accessorKey: 'destination',
      header: 'Destination',
      size: 160,
      Cell: ({ cell }) => (
        <span className="flex items-center gap-1.5 font-semibold text-on-surface">
          <span aria-hidden="true" className="material-symbols-outlined text-base text-secondary">location_on</span>
          {cell.getValue() || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'transportMode',
      header: 'Mode de transport',
      size: 180,
      Cell: ({ cell }) => {
        const mode = cell.getValue();
        const config = transportBadgeConfig[mode] || { icon: Package, className: 'border-slate-200 bg-slate-50 text-slate-600' };
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-label-sm font-semibold transition-colors hover:shadow-sm ${config.className}`}>
            <Icon aria-hidden="true" size={17} strokeWidth={2} />
            {transportLabels?.[mode] || mode || 'Mode inconnu'}
          </span>
        );
      },
    },
    {
      accessorKey: 'registeredAt',
      header: 'Date',
      size: 135,
      Cell: ({ cell }) => <span className="flex items-center gap-1.5 whitespace-nowrap text-label-sm text-on-surface-variant"><span aria-hidden="true" className="material-symbols-outlined text-base text-outline">calendar_month</span>{formatDate(cell.getValue())}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      size: 165,
      Cell: ({ cell }) => {
        const status = cell.getValue();
        const config = getShipmentStatusConfig(status);
        return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label-sm font-semibold ${statusBadgeClasses[status] || statusBadgeClasses.received}`}><span aria-hidden="true" className="material-symbols-outlined text-base">{config.icon}</span>{statusLabels[status] || status || '—'}</span>;
      },
    },
  ], [statusLabels]);
  const table = useMaterialReactTable({
    columns, data: rows, getRowId: (row) => String(row.id), enableGlobalFilter: true, enableColumnFilters: true,
    enableColumnActions: false, enableDensityToggle: false, enableFullScreenToggle: false,
    state: { globalFilter }, onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
    muiTablePaperProps: { elevation: 0, sx: { borderRadius: '12px', overflow: 'hidden' } },
    muiTableHeadCellProps: { sx: { backgroundColor: '#f5f8ff', borderBottom: '1px solid #dfe5ef', color: '#475569', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' } },
    muiTableBodyCellProps: { sx: { borderBottom: '1px solid #eef2f7', color: '#334155', padding: '14px 16px' } },
    muiTableBodyRowProps: { sx: { '&:hover td': { backgroundColor: '#f8fbff' }, transition: 'background-color 150ms ease' } },
    muiBottomToolbarProps: { sx: { borderTop: '1px solid #eef2f7' } },
    renderRowActions: ({ row }) => <button aria-label={`Voir ${row.original.serialNumber}`} className="rounded-lg p-2 text-secondary transition-colors hover:bg-blue-50 hover:text-blue-800" onClick={() => onView(row.original)} title="Voir les détails du colis" type="button"><span aria-hidden="true" className="material-symbols-outlined">visibility</span></button>,
    renderEmptyRowsFallback: () => <div className="flex flex-col items-center gap-2 p-10 text-center text-on-surface-variant"><span aria-hidden="true" className="material-symbols-outlined text-4xl text-outline">inventory_2</span><strong className="text-title-sm text-on-surface">Aucun colis enregistré</strong><span>Les nouveaux colis apparaîtront ici.</span></div>,
  });
  return <Card className="overflow-hidden p-0"><div className="border-b border-outline-variant/50 px-5 py-5"><h3 className="text-title-md font-bold text-on-surface">Derniers colis enregistrés</h3><p className="mt-1 text-body-sm text-on-surface-variant">Les données proviennent de la base MySQL.</p></div><ThemeProvider theme={theme}><MaterialReactTable table={table} /></ThemeProvider></Card>;
}
