import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFiltersButton,
  useMaterialReactTable,
} from 'material-react-table';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import {
  createAdminProfile,
  deleteAdminProfile,
  deleteAdminProfiles,
  getAdminProfile,
  listAdminProfiles,
  updateAdminProfile,
} from '../services/adminProfilesService.js';
import '../styles/admin-parcels.scss';

const tableTheme = createTheme({
  palette: { primary: { main: '#0051d5' }, background: { default: '#f8f9ff', paper: '#fff' } },
  typography: { fontFamily: 'Inter, sans-serif', fontSize: 13 },
  shape: { borderRadius: 8 },
});

const roleLabels = { admin: 'Super Administrateur', manager: 'Administrateur', operator: 'Éditeur', viewer: 'Lecteur' };
const statusLabels = { active: 'Actif', inactive: 'Inactif', suspended: 'Suspendu' };
const emptyForm = { name: '', email: '', phone: '', password: '', role: 'viewer', status: 'active' };

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function formatDate(value) {
  if (!value) return 'Jamais';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function ProfileModal({ profile, onClose, onSaved }) {
  const editing = Boolean(profile);
  const [form, setForm] = useState(profile ? { ...emptyForm, ...profile, password: '' } : emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || (!editing && form.password.length < 6)) {
      setError('Nom, e-mail et mot de passe initial (6 caractères minimum) sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone || null, role: form.role, status: form.status };
      if (form.password) payload.password = form.password;
      await (editing ? updateAdminProfile(profile.id, payload) : createAdminProfile({ ...payload, password: form.password }));
      onSaved(editing ? 'Profil administrateur modifié.' : 'Profil administrateur créé.');
    } catch (saveError) {
      setError(saveError.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="profile-modal-title" aria-modal="true" className="w-full max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" role="dialog">
        <div className="mb-5 flex items-center justify-between border-b border-outline-variant pb-3"><h2 className="text-headline-sm font-headline-sm font-bold text-on-surface" id="profile-modal-title">{editing ? 'Modifier le profil' : 'Nouvel administrateur'}</h2><button aria-label="Fermer" className="text-outline" onClick={onClose} type="button"><span className="material-symbols-outlined">close</span></button></div>
        {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-800" role="alert">{error}</p>}
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="text-label-md text-on-surface">Nom et prénom<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('name')} required value={form.name} /></label>
          <label className="text-label-md text-on-surface">Adresse e-mail<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('email')} required type="email" value={form.email} /></label>
          <label className="text-label-md text-on-surface">Téléphone<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('phone')} type="tel" value={form.phone || ''} /></label>
          <label className="text-label-md text-on-surface">Mot de passe initial{editing && <span className="text-outline"> (laisser vide pour conserver)</span>}<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" minLength="6" onChange={setField('password')} required={!editing} type="password" value={form.password} /></label>
          <label className="text-label-md text-on-surface">Rôle<select className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('role')} value={form.role}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-label-md text-on-surface">Statut<select className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('status')} value={form.status}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="flex justify-end gap-2 md:col-span-2"><button className="rounded-lg border border-outline-variant px-4 py-2" onClick={onClose} type="button">Annuler</button><button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary" disabled={saving} type="submit">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
        </form>
      </section>
    </div>
  );
}

function ProfileDetails({ profile, onClose }) {
  if (!profile) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section aria-modal="true" className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" role="dialog"><div className="flex items-center justify-between border-b border-outline-variant pb-3"><h2 className="text-headline-sm font-bold text-on-surface">Détails du profil</h2><button aria-label="Fermer" onClick={onClose} type="button"><span className="material-symbols-outlined">close</span></button></div><div className="mt-5 space-y-3 text-body-sm"><p><strong>Nom :</strong> {profile.name}</p><p><strong>E-mail :</strong> {profile.email}</p><p><strong>Téléphone :</strong> {profile.phone || 'Non renseigné'}</p><p><strong>Rôle :</strong> {roleLabels[profile.role] || profile.role}</p><p><strong>Statut :</strong> {statusLabels[profile.status] || profile.status}</p><p><strong>Dernière connexion :</strong> {formatDate(profile.lastLoginAt)}</p><p><strong>Créé le :</strong> {formatDate(profile.createdAt)}</p></div></section></div>;
}

export default function AdminProfilesPage() {
  const { onNotice } = useOutletContext();
  const { user } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [details, setDetails] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listAdminProfiles();
      if (!Array.isArray(result?.data)) throw new Error('Réponse API administrateurs invalide.');
      setRows(result.data);
    } catch (loadError) {
      setRows([]);
      setError(loadError.message || 'Impossible de charger les administrateurs.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const remove = async (profile) => {
    if (!window.confirm(`Supprimer définitivement le profil ${profile.name} ?`)) return;
    try {
      await deleteAdminProfile(profile.id);
      onNotice('Profil administrateur supprimé.');
      await loadProfiles();
    } catch (deleteError) {
      setError(deleteError.message || 'Suppression impossible.');
    }
  };

  const removeMany = async (ids) => {
    if (!window.confirm(`Supprimer définitivement les ${ids.length} profils sélectionnés ?`)) return;
    try {
      const result = await deleteAdminProfiles(ids);
      onNotice(`${result?.deletedCount ?? ids.length} profil(s) administrateur supprimé(s).`);
      await loadProfiles();
    } catch (deleteError) {
      setError(deleteError.message || 'Suppression impossible.');
    }
  };

  const exportProfiles = () => {
    const header = ['Nom', 'E-mail', 'Téléphone', 'Rôle', 'Statut', 'Dernière connexion', 'Date de création'];
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [header, ...rows.map((row) => [
      row.name,
      row.email,
      row.phone,
      roleLabels[row.role] || row.role,
      statusLabels[row.status] || row.status,
      formatDate(row.lastLoginAt),
      formatDate(row.createdAt),
    ])].map((line) => line.map(escape).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'corelink-profils-administrateurs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Collaborateur', Cell: ({ row }) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container font-bold text-surface">{initials(row.original.name)}</span><div><strong className="block">{row.original.name}</strong><span className="text-body-sm text-outline">{row.original.email}</span></div></div> },
    { accessorKey: 'role', header: 'Rôle & Permissions', Cell: ({ cell }) => <div><strong className="block">{roleLabels[cell.getValue()] || cell.getValue()}</strong><span className="text-label-sm text-on-surface-variant">{cell.getValue() === 'admin' ? 'Accès Total & Clé Maître' : 'Permissions selon le rôle'}</span></div> },
    { accessorKey: 'phone', header: 'Téléphone', Cell: ({ cell }) => cell.getValue() || '—' },
    { accessorKey: 'status', header: 'Statut', Cell: ({ cell }) => <span className={`rounded-full px-2 py-0.5 text-label-sm font-semibold ${cell.getValue() === 'active' ? 'bg-emerald-100 text-emerald-800' : cell.getValue() === 'suspended' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>{statusLabels[cell.getValue()] || cell.getValue()}</span> },
    { accessorKey: 'lastLoginAt', header: 'Dernière connexion', Cell: ({ cell }) => formatDate(cell.getValue()) },
    { accessorKey: 'createdAt', header: 'Date de création', Cell: ({ cell }) => formatDate(cell.getValue()) },
  ], []);
  const statuses = useMemo(
    () => [...new Set(rows.map((row) => row.status).filter(Boolean))],
    [rows],
  );
  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fr');
    return rows.filter((row) => {
      const matchesSearch = !query
        || [row.name, row.email, row.phone].some((value) => String(value || '').toLocaleLowerCase('fr').includes(query));
      return matchesSearch
        && (!statusFilter || row.status === statusFilter);
    });
  }, [rows, search, statusFilter]);
  const table = useMaterialReactTable({
    columns,
    data: filteredRows,
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    enableColumnFilters: true,
    enableHiding: true,
    enableGlobalFilter: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    state: { isLoading: loading },
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    muiTablePaperProps: { elevation: 0, className: 'parcel-mrt-paper' },
    muiTableContainerProps: { className: 'parcel-mrt-container' },
    renderRowActions: ({ row }) => <div className="flex gap-1"><button aria-label={`Voir ${row.original.name}`} className="rounded p-1.5 hover:bg-surface-container" onClick={async () => { try { const result = await getAdminProfile(row.original.id); setDetails(result?.data); } catch (loadError) { setError(loadError.message); } }} title="Voir" type="button"><span className="material-symbols-outlined text-lg">visibility</span></button><button aria-label={`Modifier ${row.original.name}`} className="rounded p-1.5 hover:bg-surface-container" onClick={() => setModal(row.original)} title="Modifier" type="button"><span className="material-symbols-outlined text-lg">edit</span></button><button aria-label={`Supprimer ${row.original.name}`} className="rounded p-1.5 text-error hover:bg-red-50" onClick={() => remove(row.original)} title="Supprimer" type="button"><span className="material-symbols-outlined text-lg">delete</span></button></div>,
    renderEmptyRowsFallback: () => <div className="parcel-empty-state"><strong>Aucun profil administrateur à afficher</strong><span>Modifiez les filtres ou créez un nouveau profil.</span></div>,
  });

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    table.resetColumnFilters();
  };
  const selectedIds = table.getSelectedRowModel().rows.map(({ original }) => original.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-headline-lg font-headline-lg font-bold tracking-tight text-on-surface">Gestion des Profils</h1><p className="mt-1 text-body-md text-on-surface-variant">Gérez les rôles, permissions et l’activité de l’équipe logistique.</p></div><div className="flex flex-wrap gap-2"><button className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-title-sm" onClick={exportProfiles} type="button"><span className="material-symbols-outlined mr-1 align-middle text-lg">download</span>Exporter l’audit des accès</button><button className="rounded-lg bg-secondary px-4 py-2 text-title-sm text-on-secondary" onClick={() => setModal({ ...emptyForm })} type="button"><span className="material-symbols-outlined mr-1 align-middle text-lg">person_add</span>Nouvel Administrateur</button></div></header>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-800" role="alert">{error}</div>}
      <section className="parcel-filter-bar">
        <div className="parcel-filter-controls">
          <label className="parcel-search-field">
            <span aria-hidden="true" className="material-symbols-outlined">search</span>
            <input aria-label="Rechercher un profil" onChange={(event) => setSearch(event.target.value)} placeholder="Nom, e-mail ou téléphone..." type="search" value={search} />
            {search && <button aria-label="Effacer la recherche" onClick={() => setSearch('')} type="button"><span aria-hidden="true" className="material-symbols-outlined">cancel</span></button>}
          </label>
          <label className="parcel-select-field">
            <span className="sr-only">Filtrer par statut</span>
            <select aria-label="Filtrer par statut" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="">Statut : Tous les statuts</option>
              {statuses.map((status) => <option key={status} value={status}>{statusLabels[status] || status}</option>)}
            </select>
            <span aria-hidden="true" className="material-symbols-outlined">expand_more</span>
          </label>
        </div>
        <div className="parcel-filter-actions">
          {selectedIds.length > 0 && <button className="parcel-reset-button" onClick={() => removeMany(selectedIds)} type="button"><span aria-hidden="true" className="material-symbols-outlined">delete</span>Supprimer ({selectedIds.length})</button>}
          <button className="parcel-reset-button" onClick={resetFilters} type="button"><span aria-hidden="true" className="material-symbols-outlined">filter_alt_off</span>Réinitialiser</button>
          <span aria-hidden="true" className="parcel-filter-divider" />
          <button aria-label="Rafraîchir les données" className="parcel-reset-button" onClick={loadProfiles} type="button"><span aria-hidden="true" className="material-symbols-outlined">refresh</span>Actualiser</button>
          <MRT_ToggleFiltersButton aria-label="Filtres par colonne" table={table} />
          <MRT_ShowHideColumnsButton aria-label="Colonnes visibles" table={table} />
        </div>
      </section>
      <section aria-label="Liste des profils administrateurs" className="parcel-table-panel"><ThemeProvider theme={tableTheme}><MaterialReactTable table={table} /></ThemeProvider></section>
      {modal && <ProfileModal onClose={() => setModal(null)} onSaved={async (message) => { setModal(null); onNotice(message); await loadProfiles(); }} profile={modal.id ? modal : null} />}
      {details && <ProfileDetails onClose={() => setDetails(null)} profile={details} />}
    </div>
  );
}
