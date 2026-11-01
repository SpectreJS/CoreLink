import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { AdminBadge, AdminButton, AdminField, AdminTable } from '../components/common/AdminUI.jsx';
import ParcelDataTable from '../components/parcels/ParcelDataTable.jsx';
import AdminParcelCreatePage from './AdminParcelCreatePage.jsx';
import '../styles/admin-parcels.scss';
import { deleteParcel, deleteParcels, listParcelStatuses, listParcelTransportModes, listParcels } from '../services/parcelService.js';
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

export function AdminParcelsPage() {
  const [rows, setRows] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
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
    if (!window.confirm(`Supprimer définitivement le colis ${parcel.trackingNumber} ?`)) return;
    setActionNotice('');
    try {
      await deleteParcel(parcel.id);
      setActionNotice(`Le colis ${parcel.trackingNumber} a été supprimé.`);
      await loadParcels();
    } catch (deleteError) {
      setError(deleteError.message || 'La suppression du colis a échoué.');
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
          <Link className="parcel-management-button is-primary" to="/admin/parcels/new">
            <span aria-hidden="true" className="material-symbols-outlined">add</span>
            Enregistrer un colis
          </Link>
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
        onEdit={(parcel) => navigate(`/admin/parcels/${encodeURIComponent(parcel.id)}/edit`)}
        onView={(parcel) => navigate(`/admin/parcels/${encodeURIComponent(parcel.id)}`)}
        rows={rows}
        statuses={statuses}
        transportModes={transportModes}
      />
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
  invoices: { title: 'Factures', description: 'Suivez les factures émises et leur statut.', columns: ['N° facture', 'Client', 'Montant', 'Échéance'] },
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
