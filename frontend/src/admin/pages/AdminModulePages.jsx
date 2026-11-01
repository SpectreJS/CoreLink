import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { AdminBadge, AdminButton, AdminField, AdminTable } from '../components/common/AdminUI.jsx';
import ParcelDataTable from '../components/parcels/ParcelDataTable.jsx';
import AdminParcelCreatePage from './AdminParcelCreatePage.jsx';
import '../styles/admin-parcels.scss';
import { createParcel, deleteParcel, deleteParcels, getParcel, getParcelStatusHistory, listParcelStatuses, listParcelTransportModes, listParcels, updateParcel } from '../services/parcelService.js';
import ShipmentStatusSelector from '../components/parcels/ShipmentStatusSelector.jsx';
import TransportModeSelector from '../components/parcels/TransportModeSelector.jsx';
import { getShipmentStatusConfig } from '../components/parcels/shipmentStatusConfig.js';
import { createCustomer, getCustomer, listCustomers } from '../services/customerService.js';
import ParcelDetailsPage from './AdminParcelDetailsPage.jsx';
import AdminPricingPage from './AdminPricingPage.jsx';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';

function PageHeading({ title, description, action }) {
  return (
    <div className="admin-page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

const emptyParcelForm = {
  description: '',
  category: '',
  packageCount: '1',
  weight: '',
  length: '',
  width: '',
  height: '',
  customerName: '',
  recipientName: '',
  phone: '',
  email: '',
  origin: '',
  destination: '',
  transportMode: '',
  status: '',
  notes: '',
};

function ParcelModal({ mode, parcelId, statuses, transportModes, onClose, onSaved }) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const [parcel, setParcel] = useState(null);
  const [form, setForm] = useState(emptyParcelForm);
  const [loading, setLoading] = useState(isEdit || isView);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, saving]);

  useEffect(() => {
    if (!parcelId) return undefined;
    let active = true;
    Promise.all([getParcel(parcelId), getParcelStatusHistory(parcelId)])
      .then(([result, historyResult]) => {
        if (!result?.data) throw new Error('Colis introuvable.');
        if (!active) return;
        const value = result.data;
        setParcel(value);
        setForm(Object.fromEntries(Object.keys(emptyParcelForm).map((field) => [field, value[field] == null ? '' : String(value[field])])));
        setHistory(Array.isArray(historyResult?.data) ? historyResult.data : []);
      })
      .catch((loadError) => { if (active) setError(loadError.message || 'Impossible de charger le colis.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [parcelId]);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.description.trim() || !form.category.trim() || !form.customerName.trim() || !form.phone.trim()
      || !form.origin.trim() || !form.destination.trim() || !form.transportMode || !form.weight || Number(form.weight) <= 0
      || !form.packageCount || Number(form.packageCount) < 1) {
      setError('Description, catégorie, client, téléphone, origine, destination, transport, poids et nombre de colis sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        description: form.description.trim(),
        category: form.category.trim(),
        packageCount: Number(form.packageCount),
        weight: Number(form.weight),
        length: Number(form.length) || 0,
        width: Number(form.width) || 0,
        height: Number(form.height) || 0,
        customerName: form.customerName.trim(),
        recipientName: form.recipientName.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim(),
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        transportMode: form.transportMode,
        notes: form.notes.trim() || null,
      };
      if (isEdit) payload.status = form.status;
      if (isEdit && parcel?.status !== form.status) {
        const previousLabel = statuses.find((item) => item.value === parcel?.status)?.label || parcel?.status;
        const nextLabel = statuses.find((item) => item.value === form.status)?.label || form.status;
        if (!window.confirm(`Confirmer le changement du statut ${previousLabel} vers ${nextLabel} ?`)) return;
      }
      const result = isEdit ? await updateParcel(parcelId, payload) : await createParcel(payload);
      await onSaved(isEdit ? `Le colis ${result.data.serialNumber} a été modifié.` : `Le colis ${result.data.serialNumber} a été créé.`);
    } catch (saveError) {
      setError(saveError.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  const title = isView ? 'Détails du colis' : isEdit ? 'Modifier le colis' : 'Enregistrer un colis';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <section aria-labelledby="parcel-modal-title" aria-modal="true" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" role="dialog">
        <div className="mb-5 flex items-center justify-between border-b border-outline-variant pb-3">
          <h2 className="text-headline-sm font-bold text-on-surface" id="parcel-modal-title">{title}</h2>
          <button aria-label="Fermer" className="text-outline" disabled={saving} onClick={onClose} type="button"><span className="material-symbols-outlined">close</span></button>
        </div>
        {loading && <p aria-live="polite" className="py-8 text-center text-on-surface-variant">Chargement du colis…</p>}
        {!loading && error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-800" role="alert">{error}</p>}
        {!loading && !error && isView && parcel && (
          <div className="grid grid-cols-1 gap-4 text-body-sm md:grid-cols-2">
            <div className="rounded-lg border border-secondary/30 bg-surface-container-low p-4 md:col-span-2">
              <span className="block text-label-sm text-outline">Statut actuel</span>
              <strong className="mt-1 flex items-center gap-2 text-title-md text-on-surface">
                <span aria-hidden="true" className={`material-symbols-outlined shipment-status-history-icon is-${getShipmentStatusConfig(parcel.status).tone}`}>{getShipmentStatusConfig(parcel.status).icon}</span>
                {parcel.statusLabel || statuses.find((item) => item.value === parcel.status)?.label || parcel.status}
              </strong>
            </div>
            {[
              ['N° de série', parcel.serialNumber || '—'],
              ['N° de suivi externe', parcel.trackingNumber || '—'],
              ['Description', parcel.description],
              ['Catégorie', parcel.category],
              ['Client associé', parcel.customerName],
              ['Téléphone', parcel.phone],
              ['Origine', parcel.origin],
              ['Destination', parcel.destination],
              ['Mode de transport', transportModes.find((item) => item.value === parcel.transportMode)?.label || parcel.transportMode],
              ['Poids', `${parcel.weight} kg`],
              ['Nombre de colis', parcel.packageCount],
              ['Date de création', parcel.registeredAt ? new Date(parcel.registeredAt).toLocaleString('fr-FR') : '—'],
              ['Date de livraison estimée', 'Non fournie par l’API'],
              ['Historique de suivi', history.length ? `${history.length} changement(s)` : 'Aucun changement enregistré'],
            ].map(([label, value]) => <div className="rounded-lg bg-surface-container-low p-3" key={label}><span className="block text-label-sm text-outline">{label}</span><strong className="text-on-surface">{value || '—'}</strong></div>)}
            {history.length > 0 && <div className="md:col-span-2 border-t border-outline-variant pt-4"><h3 className="mb-3 font-semibold">Historique des statuts</h3><div className="space-y-3">{history.map((event) => { const config = getShipmentStatusConfig(event.newStatus); return <div className="flex items-start gap-3" key={event.id}><span className={`shipment-status-history-icon is-${config.tone}`}><span aria-hidden="true" className="material-symbols-outlined">{config.icon}</span></span><div><strong>{event.newLabel}</strong><p className="text-label-sm text-outline">{new Date(event.createdAt).toLocaleString('fr-FR')} · {event.changedBy}</p></div></div>; })}</div></div>}
            <div className="md:col-span-2 flex justify-end"><button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary" onClick={onClose} type="button">Fermer</button></div>
          </div>
        )}
        {!loading && !error && !isView && (
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
            {[
              ['description', 'Description', 'text'],
              ['category', 'Catégorie', 'text'],
              ['customerName', 'Client', 'text'],
              ['phone', 'Téléphone', 'tel'],
              ['origin', 'Origine', 'text'],
              ['destination', 'Destination', 'text'],
            ].map(([field, label, type]) => <label className="text-label-md text-on-surface" key={field}>{label}<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField(field)} required value={form[field]} type={type} /></label>)}
            {isEdit ? (
              <TransportModeSelector modes={transportModes} onChange={(value) => setForm((current) => ({ ...current, transportMode: value }))} value={form.transportMode} />
            ) : (
              <label className="text-label-md text-on-surface">Mode de transport<select className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('transportMode')} required value={form.transportMode}><option value="">Sélectionner</option>{transportModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            )}
            {isEdit && <ShipmentStatusSelector onChange={(value) => setForm((current) => ({ ...current, status: value }))} previousValue={parcel?.status} statuses={statuses} value={form.status} />}
            <label className="text-label-md text-on-surface">Poids (kg)<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" min="0.01" onChange={setField('weight')} required step="0.01" type="number" value={form.weight} /></label>
            <label className="text-label-md text-on-surface">Nombre de colis<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" min="1" onChange={setField('packageCount')} required type="number" value={form.packageCount} /></label>
            <label className="text-label-md text-on-surface">Destinataire<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('recipientName')} value={form.recipientName} /></label>
            <label className="text-label-md text-on-surface">E-mail<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('email')} type="email" value={form.email} /></label>
            <div className="flex justify-end gap-2 md:col-span-2"><button className="rounded-lg border border-outline-variant px-4 py-2" disabled={saving} onClick={onClose} type="button">Annuler</button><button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary" disabled={saving} type="submit">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          </form>
        )}
      </section>
    </div>
  );
}

function DeleteParcelModal({ parcel, onClose, onConfirm, loading }) {
  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading, onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !loading && onClose()}><section aria-modal="true" className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" role="dialog"><h2 className="text-headline-sm font-bold text-on-surface">Confirmer la suppression</h2><p className="mt-3 text-body-sm text-on-surface-variant">Supprimer le colis <strong>{parcel.trackingNumber}</strong> — {parcel.contents} ?</p><div className="mt-6 flex justify-end gap-2"><button className="rounded-lg border border-outline-variant px-4 py-2" disabled={loading} onClick={onClose} type="button">Annuler</button><button className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white" disabled={loading} onClick={onConfirm} type="button">{loading ? 'Suppression…' : 'Confirmer la suppression'}</button></div></section></div>;
}

export function AdminParcelsPage() {
  const [rows, setRows] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAdminAuth();
  const location = useLocation();
  const canMutate = ['admin', 'manager', 'operator'].includes(user?.role);

  const loadParcels = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [parcelResult, statusResult, transportResult] = await Promise.all([
        listParcels(),
        listParcelStatuses(),
        listParcelTransportModes(),
      ]);
      if (!Array.isArray(parcelResult?.data) || !Array.isArray(statusResult?.data) || !Array.isArray(transportResult?.data)) {
        throw new Error('Réponse API invalide lors du chargement des colis.');
      }
      const statusLabels = new Map(statusResult.data.map((status) => [status.value, status.label]));
      const transportLabels = new Map(transportResult.data.map((mode) => [mode.value, mode.label]));
      setStatuses(statusResult.data);
      setTransportModes(transportResult.data);
      setRows(parcelResult.data.map((parcel) => ({
        ...parcel,
        id: String(parcel.id),
        trackingNumber: parcel.trackingNumber,
        customerPhone: parcel.phone,
        contents: parcel.description,
        transportKey: parcel.transportMode,
        transportMode: transportLabels.get(parcel.transportMode) || parcel.transportMode,
        weight: Number(parcel.weight),
        volume: Number(parcel.volume),
        statusKey: parcel.status,
        statusLabel: parcel.statusLabel || statusLabels.get(parcel.status) || parcel.status,
      })));
    } catch (loadError) {
      setRows([]);
      setStatuses([]);
      setTransportModes([]);
      setError(loadError.message || 'Impossible de charger les colis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadParcels(); }, [loadParcels]);
  useEffect(() => {
    if (location.state?.notice) setActionNotice(location.state.notice);
  }, [location.state]);

  const removeParcel = async (parcel) => {
    setActionNotice('');
    setDeleteTarget(parcel);
  };

  const confirmRemoveParcel = async () => {
    if (!deleteTarget) return;
    const parcel = deleteTarget;
    setDeleting(true);
    try {
      await deleteParcel(parcel.id);
      setActionNotice(`Le colis ${parcel.trackingNumber} a été supprimé.`);
      await loadParcels();
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError.message || 'La suppression du colis a échoué.');
    } finally {
      setDeleting(false);
    }
  };

  const removeParcels = async (ids) => {
    if (!window.confirm(`Supprimer définitivement les ${ids.length} colis sélectionnés ?`)) return;
    setActionNotice('');
    try {
      const result = await deleteParcels(ids);
      setActionNotice(`${result?.deletedCount ?? ids.length} colis supprimé(s).`);
      await loadParcels();
    } catch (deleteError) {
      setError(deleteError.message || 'La suppression des colis a échoué.');
    }
  };

  const exportParcels = () => {
    const columns = [
      ['trackingNumber', 'N° de suivi'],
      ['customerName', 'Client'],
      ['customerPhone', 'Téléphone'],
      ['contents', 'Nature & contenu'],
      ['transportMode', 'Mode de transport'],
      ['origin', 'Origine'],
      ['destination', 'Destination'],
      ['weight', 'Poids'],
      ['volume', 'Volume'],
      ['statusLabel', 'Statut'],
      ['registeredAt', 'Date enregistrée'],
    ];
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [
      columns.map(([, label]) => escapeCell(label)).join(';'),
      ...rows.map((row) => columns.map(([key]) => escapeCell(row[key])).join(';')),
    ].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'corelink-colis.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const inTransitCount = rows.filter((row) => ['air_transit', 'sea_transit'].includes(row.statusKey)).length;
  const customsCount = rows.filter((row) => row.statusKey === 'customs_clearance').length;
  const readyCount = rows.filter((row) => row.statusKey === 'ready_for_pickup').length;

  return (
    <div className="parcel-management-page">
      <section className="parcel-management-heading">
        <div>
          <h1>Gestion des Colis &amp; Expéditions</h1>
          <p>Surveillez, filtrez et mettez à jour l’ensemble des colis enregistrés sur le corridor Chine – Madagascar.</p>
        </div>
        <div className="parcel-management-heading-actions">
          <button aria-label="Actualiser la liste des colis" className="parcel-management-button" disabled={isLoading} onClick={loadParcels} type="button">
            <span aria-hidden="true" className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Actualiser
          </button>
          <button className="parcel-management-button" onClick={exportParcels} type="button">
            <span aria-hidden="true" className="material-symbols-outlined">download</span>
            Exporter CSV / Excel
          </button>
          <button className="parcel-management-button is-primary" onClick={() => setModal({ mode: 'create' })} type="button">
            <span aria-hidden="true" className="material-symbols-outlined">add</span>
            Enregistrer un colis
          </button>
        </div>
      </section>

      <section aria-label="Indicateurs colis" className="parcel-kpi-grid">
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Total corridor actif</span>
            <div className="parcel-kpi-values"><strong>{isLoading ? '…' : rows.length}</strong><span className="is-positive">colis enregistrés</span></div>
          </div>
          <div className="parcel-kpi-icon"><span aria-hidden="true" className="material-symbols-outlined">inventory_2</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">En Vol / Transit Mer</span>
            <div className="parcel-kpi-values"><strong>{isLoading ? '…' : inTransitCount}</strong><span className="is-blue">selon le statut actuel</span></div>
          </div>
          <div className="parcel-kpi-icon is-muted"><span aria-hidden="true" className="material-symbols-outlined">flight_takeoff</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Dédouanement Ivato</span>
            <div className="parcel-kpi-values"><strong>{isLoading ? '…' : customsCount}</strong><span>statut actuel</span></div>
          </div>
          <div className="parcel-kpi-icon is-customs"><span aria-hidden="true" className="material-symbols-outlined">gavel</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Prêt au retrait TNR</span>
            <div className="parcel-kpi-values"><strong>{isLoading ? '…' : readyCount}</strong><span className="is-positive">statut actuel</span></div>
          </div>
          <div className="parcel-kpi-icon is-ready"><span aria-hidden="true" className="material-symbols-outlined">check_circle</span></div>
        </div>
      </section>

      {error && <div className="parcel-data-error" role="alert">{error}</div>}
      {actionNotice && <div className="parcel-data-notice" role="status">{actionNotice}</div>}

      <ParcelDataTable
        canMutate={canMutate}
        isLoading={isLoading}
        onDelete={removeParcel}
        onDeleteMany={removeParcels}
        onEdit={(parcel) => setModal({ mode: 'edit', parcelId: parcel.id })}
        onView={(parcel) => setModal({ mode: 'view', parcelId: parcel.id })}
        rows={rows}
        statuses={statuses}
        transportModes={transportModes}
      />
      {modal && <ParcelModal mode={modal.mode} onClose={() => setModal(null)} onSaved={async (message) => { setModal(null); setActionNotice(message); await loadParcels(); }} parcelId={modal.parcelId} statuses={statuses} transportModes={transportModes} />}
      {deleteTarget && <DeleteParcelModal loading={deleting} onClose={() => setDeleteTarget(null)} onConfirm={confirmRemoveParcel} parcel={deleteTarget} />}
    </div>
  );
}

export function AdminParcelFormPage({ edit = false }) {
  return <AdminParcelCreatePage edit={edit} />;
}

export function AdminParcelDetailsPage() {
  return <ParcelDetailsPage />;
}

export function AdminCustomersPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { listCustomers().then((result) => setRows(result?.data || [])).catch((loadError) => setError(loadError.message)); }, []);

  return (
    <>
      <PageHeading title="Clients" description="Consultez et gérez les comptes clients." action={<AdminButton to="/admin/customers/new"><span className="material-symbols-outlined">person_add</span>Nouveau client</AdminButton>} />
      <div className="admin-demo-notice">Aucune donnée client réelle n’est chargée. Les clients d’exemple sont explicitement fictifs.</div>
      {error && <p className="admin-alert" style={{ marginTop: 16 }}>{error}</p>}
      <section className="admin-card" style={{ marginTop: 18 }}>
        <AdminTable columns={[{ key: 'name', label: 'Nom' }, { key: 'email', label: 'E-mail' }, { key: 'parcels', label: 'Colis' }, { key: 'status', label: 'Statut' }]} rows={rows.map((row) => ({ ...row, id: row.id || row.email }))} emptyMessage="Le backend client n’est pas encore configuré." />
      </section>
    </>
  );
}

export function AdminCustomerFormPage({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  useEffect(() => {
    if (!edit || !id) return;
    getCustomer(id).then((result) => setForm((current) => ({ ...current, ...(result?.data || {}) }))).catch((loadError) => setError(loadError.message));
  }, [edit, id]);
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await createCustomer(form);
      navigate(`/admin/customers/${encodeURIComponent(result?.data?.id || 'new')}`);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <>
      <PageHeading title={edit ? 'Modifier le client' : 'Nouveau client'} description="La gestion des clients sera active après connexion au backend." />
      <section className="admin-card admin-card-body">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <AdminField label="Nom complet" onChange={setField('name')} required value={form.name} />
            <AdminField label="E-mail" onChange={setField('email')} required type="email" value={form.email} />
            <AdminField label="Téléphone" onChange={setField('phone')} type="tel" value={form.phone} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminButton type="submit">Enregistrer</AdminButton>
            <AdminButton className="is-secondary" onClick={() => navigate('/admin/customers')}>Annuler</AdminButton>
          </div>
        </form>
      </section>
    </>
  );
}

export function AdminCustomerDetailsPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getCustomer(id).then((result) => setCustomer(result?.data)).catch((loadError) => setError(loadError.message)); }, [id]);
  return (
    <>
      <PageHeading title="Détail client" description={`Référence : ${id}`} action={<AdminButton to={`/admin/customers/${encodeURIComponent(id)}/edit`}>Modifier</AdminButton>} />
      <section className="admin-card admin-card-body">
        <div className="admin-demo-notice">Données privées : affichage uniquement après autorisation API backend.</div>
        {error && <p className="admin-alert" style={{ marginTop: 16 }}>{error}</p>}
        {customer && <pre style={{ overflow: 'auto' }}>{JSON.stringify(customer, null, 2)}</pre>}
      </section>
    </>
  );
}

const modules = {
  tracking: { title: 'Gestion du suivi', description: 'Ajoutez des événements de suivi aux colis.', columns: ['Colis', 'Événement', 'Lieu', 'Date'] },
  shipments: { title: 'Expéditions', description: 'Organisez les lots, itinéraires et départs.', columns: ['Référence', 'Route', 'Départ', 'Statut'] },
  payments: { title: 'Paiements', description: 'Consultez les encaissements et rapprochements.', columns: ['Référence', 'Client', 'Montant', 'Statut'] },
  reports: { title: 'Rapports & analyses', description: 'Les indicateurs réels seront disponibles via l’API.', columns: ['Rapport', 'Période', 'État', 'Dernière génération'] },
  users: { title: 'Utilisateurs & permissions', description: 'Gérez les comptes et rôles administratifs.', columns: ['Nom', 'E-mail', 'Rôle', 'Statut'] },
  settings: { title: 'Paramètres', description: 'Configuration de l’organisation et des notifications.', columns: ['Paramètre', 'Valeur', 'Dernière mise à jour'] },
};

export function AdminModulePage({ module }) {
  const { onNotice } = useOutletContext();
  if (module === 'tracking') return <AdminPricingPage onNotice={onNotice} />;
  const info = modules[module];
  return (
    <>
      <PageHeading title={info.title} description={info.description} />
      <div className="admin-demo-notice">Module en préparation. Aucune donnée fictive n’est présentée comme réelle; la connexion au backend est requise pour activer cette fonction.</div>
      <section className="admin-card" style={{ marginTop: 18 }}>
        <div className="admin-card-header"><h2>{info.title}</h2><AdminBadge>API à intégrer</AdminBadge></div>
        <AdminTable columns={info.columns.map((label, index) => ({ key: `col-${index}`, label }))} rows={[]} emptyMessage="Aucune donnée disponible pour le moment." />
      </section>
      {module === 'tracking' && <AdminButton style={{ marginTop: 14 }} to="/admin/parcels">Voir les colis</AdminButton>}
      {module === 'shipments' && <AdminButton style={{ marginTop: 14 }} to="/admin/parcels">Gérer les colis</AdminButton>}
    </>
  );
}
