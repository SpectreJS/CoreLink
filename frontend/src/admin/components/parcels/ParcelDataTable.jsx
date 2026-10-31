import React, { useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';

const parcelTheme = createTheme({
  palette: {
    primary: { main: '#0051d5' },
    text: { primary: '#0b1c30', secondary: '#45464d' },
    divider: '#c6c6cd',
    background: { default: '#f8f9ff', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

const statusOptions = [
  ['reception_chine', 'Réception Chine (Guangzhou/Yiwu)'],
  ['transit_aerien', 'En transit aérien'],
  ['transit_maritime', 'En transit maritime'],
  ['dedouanement', 'Dédouanement Ivato TNR'],
  ['pret_retrait', 'Prêt au retrait (Behintsy)'],
  ['livre', 'Livré au client'],
];

const transportOptions = [
  ['air_express', 'Fret Aérien Express (3-5j)'],
  ['air_regulier', 'Fret Aérien Régulier (7-10j)'],
  ['sea_lcl', 'Fret Maritime Groupage (LCL 35j)'],
];

const statusTone = {
  dedouanement: 'customs',
  transit_maritime: 'transit',
  pret_retrait: 'ready',
  reception_chine: 'reception',
  transit_aerien: 'air',
  livre: 'delivered',
};

function formatRegisteredAt(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function matchesDateRange(dateValue, dateRange) {
  if (dateRange === 'all') return true;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (dateRange === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  const days = Number(dateRange);
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return date >= start && date <= now;
}

function ParcelStatus({ parcel }) {
  return (
    <span className={`parcel-status is-${statusTone[parcel.statusKey] || 'reception'}`}>
      <span aria-hidden="true" className="parcel-status-dot" />
      {parcel.status}
    </span>
  );
}

export default function ParcelDataTable({ rows, isLoading, onDelete, onView, onEdit }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [transportFilter, setTransportFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filteredRows = useMemo(() => rows.filter((row) => (
    (!statusFilter || row.statusKey === statusFilter)
    && (!transportFilter || row.transportKey === transportFilter)
    && matchesDateRange(row.registeredAt, dateFilter)
  )), [dateFilter, rows, statusFilter, transportFilter]);

  const columns = useMemo(() => [
    {
      accessorKey: 'trackingNumber',
      header: 'N° de suivi',
      size: 130,
      Cell: ({ cell }) => <span className="parcel-tracking-number">{cell.getValue()}</span>,
    },
    {
      accessorKey: 'customerName',
      header: 'Client & Téléphone',
      size: 205,
      Cell: ({ row }) => (
        <div className="parcel-table-primary-cell">
          <strong>{row.original.customerName}</strong>
          <span>{row.original.customerPhone}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contents',
      header: 'Nature & Contenu',
      size: 230,
      Cell: ({ row }) => (
        <div className="parcel-table-content-cell">
          <span className="parcel-table-content-title">{row.original.contents}</span>
          <span>{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: 'transportMode',
      header: 'Mode / Trajet',
      size: 220,
      Cell: ({ row }) => (
        <div className="parcel-table-route-cell">
          <span>{row.original.origin}</span>
          <span aria-hidden="true" className="material-symbols-outlined">arrow_forward</span>
          <span>{row.original.destination}</span>
          <small>{row.original.transportMode}</small>
        </div>
      ),
    },
    {
      accessorKey: 'weight',
      header: 'Poids & Vol.',
      size: 118,
      Cell: ({ row }) => (
        <div className="parcel-table-weight-cell">
          <strong>{row.original.weight}</strong>
          <span>{row.original.volume} (Vol.)</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut Opérationnel',
      size: 180,
      Cell: ({ row }) => <ParcelStatus parcel={row.original} />,
    },
    {
      accessorKey: 'registeredAt',
      header: 'Date Enreg.',
      size: 120,
      Cell: ({ cell }) => formatRegisteredAt(cell.getValue()),
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: filteredRows,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableColumnFilters: true,
    enableColumnFilterModes: false,
    enableGlobalFilterModes: false,
    enableHiding: true,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableTopToolbar: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-select': { size: 42, header: '' },
      'mrt-row-actions': { header: 'Actions rapides', size: 112 },
    },
    initialState: {
      pagination: { pageIndex: 0, pageSize: 8 },
      showColumnFilters: false,
    },
    state: { globalFilter, isLoading },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'contains',
    muiTablePaperProps: {
      elevation: 0,
      className: 'parcel-mrt-paper',
    },
    muiTableContainerProps: {
      className: 'parcel-mrt-container',
    },
    muiTableHeadCellProps: {
      className: 'parcel-mrt-head-cell',
    },
    muiTableBodyCellProps: {
      className: 'parcel-mrt-body-cell',
    },
    muiTableBodyRowProps: {
      className: 'parcel-mrt-body-row',
    },
    muiBottomToolbarProps: {
      className: 'parcel-mrt-bottom-toolbar',
    },
    muiPaginationProps: {
      rowsPerPageOptions: [8, 25, 50, 100],
      showFirstButton: false,
      showLastButton: false,
      shape: 'rounded',
    },
    renderEmptyRowsFallback: () => (
      <div className="parcel-empty-state">
        <strong>Aucun colis à afficher</strong>
        <span>Modifiez les filtres ou enregistrez un nouveau colis.</span>
      </div>
    ),
    renderRowActions: ({ row }) => (
      <div className="parcel-row-actions">
        <button
          aria-label={`Voir le colis ${row.original.trackingNumber}`}
          className="parcel-row-action is-primary"
          onClick={() => onView(row.original)}
          title="Voir détails"
          type="button"
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>
        <button
          aria-label={`Modifier le colis ${row.original.trackingNumber}`}
          className="parcel-row-action"
          onClick={() => onEdit(row.original)}
          title="Modifier"
          type="button"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
        <button
          aria-label={`Supprimer le colis ${row.original.trackingNumber}`}
          className="parcel-row-action is-danger"
          onClick={() => onDelete(row.original)}
          title="Supprimer"
          type="button"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    ),
  });

  const resetFilters = () => {
    setGlobalFilter('');
    setStatusFilter('');
    setTransportFilter('');
    setDateFilter('all');
    table.resetColumnFilters();
  };

  return (
    <>
      <section className="parcel-filter-bar">
        <div className="parcel-filter-controls">
          <label className="parcel-search-field">
            <span aria-hidden="true" className="material-symbols-outlined">search</span>
            <input
              aria-label="Rechercher un colis"
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Numéro de suivi (CL-2025-...) ou nom du client..."
              type="search"
              value={globalFilter}
            />
            {globalFilter && (
              <button aria-label="Effacer la recherche" onClick={() => setGlobalFilter('')} type="button">
                <span aria-hidden="true" className="material-symbols-outlined">cancel</span>
              </button>
            )}
          </label>
          <label className="parcel-select-field">
            <span className="sr-only">Filtrer par statut</span>
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">Statut : Tous les statuts</option>
              {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <span aria-hidden="true" className="material-symbols-outlined">expand_more</span>
          </label>
          <label className="parcel-select-field">
            <span className="sr-only">Filtrer par mode de transport</span>
            <select onChange={(event) => setTransportFilter(event.target.value)} value={transportFilter}>
              <option value="">Fret : Tous les modes</option>
              {transportOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <span aria-hidden="true" className="material-symbols-outlined">expand_more</span>
          </label>
          <label className="parcel-select-field">
            <span className="sr-only">Filtrer par période</span>
            <select onChange={(event) => setDateFilter(event.target.value)} value={dateFilter}>
              <option value="all">Période : Toutes les dates</option>
              <option value="7">Période : 7 derniers jours</option>
              <option value="30">Période : 30 derniers jours</option>
              <option value="month">Période : Ce mois</option>
            </select>
            <span aria-hidden="true" className="material-symbols-outlined">calendar_today</span>
          </label>
        </div>
        <div className="parcel-filter-actions">
          <button className="parcel-reset-button" onClick={resetFilters} type="button">
            <span aria-hidden="true" className="material-symbols-outlined">filter_alt_off</span>
            Réinitialiser
          </button>
          <span aria-hidden="true" className="parcel-filter-divider" />
          <MRT_ToggleFiltersButton aria-label="Filtres par colonne" table={table} />
          <MRT_ShowHideColumnsButton aria-label="Colonnes visibles" table={table} />
        </div>
      </section>

      <section aria-label="Liste des colis" className="parcel-table-panel">
        <ThemeProvider theme={parcelTheme}>
          <MaterialReactTable table={table} />
        </ThemeProvider>
      </section>
    </>
  );
}
