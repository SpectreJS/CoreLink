import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminBadge, AdminButton, AdminField, AdminTable } from '../components/common/AdminUI.jsx';
import ParcelDataTable from '../components/parcels/ParcelDataTable.jsx';
import { DEMO_PARCEL_RECORDS } from '../data/parcelManagementData.js';
import '../styles/admin-parcels.scss';
import { createParcel, getParcel, listParcels, updateParcel } from '../services/parcelService.js';
import { createCustomer, getCustomer, listCustomers } from '../services/customerService.js';

function PageHeading({ title, description, action }) {
  return (
    <div className="admin-page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action}
    </div>
  );
}

export function AdminParcelsPage() {
  const [rows, setRows] = useState(DEMO_PARCEL_RECORDS);
  const [error, setError] = useState('');
  const [usingDemoData, setUsingDemoData] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    listParcels()
      .then((result) => {
        if (!Array.isArray(result?.data)) {
          throw new Error('La réponse de l’API colis est invalide.');
        }
        setRows(result.data.map((parcel) => {
          const customer = parcel.customer && typeof parcel.customer === 'object' ? parcel.customer : {};
          const trackingNumber = parcel.trackingNumber || parcel.tracking || '';
          const status = parcel.status || 'Statut inconnu';
          const transportMode = parcel.transportMode || parcel.mode || '';
          const normalizedStatus = {
            'Dédouanement Ivato': 'dedouanement',
            'En transit maritime': 'transit_maritime',
            'Prêt au retrait': 'pret_retrait',
            'Réception Chine': 'reception_chine',
            'En transit aérien': 'transit_aerien',
            'Livré au client': 'livre',
          }[status] || parcel.statusKey || 'other';
          const normalizedTransport = transportMode.toLowerCase().includes('maritime')
            ? 'sea_lcl'
            : transportMode.toLowerCase().includes('régulier')
              ? 'air_regulier'
              : transportMode.toLowerCase().includes('aérien')
                ? 'air_express'
                : parcel.transportKey || '';

          return {
            ...parcel,
            id: String(parcel.id ?? trackingNumber),
            trackingNumber,
            customerName: parcel.customerName || customer.name || parcel.customer || '—',
            customerPhone: parcel.customerPhone || customer.phone || parcel.phone || '—',
            contents: parcel.contents || parcel.description || parcel.content || '—',
            category: parcel.category || parcel.contentType || '',
            origin: parcel.origin || '—',
            destination: parcel.destination || '—',
            transportMode,
            transportKey: parcel.transportKey || normalizedTransport,
            weight: parcel.weight ? `${parcel.weight}${typeof parcel.weight === 'number' ? ' kg' : ''}` : '—',
            volume: parcel.volume ? `${parcel.volume}${typeof parcel.volume === 'number' ? ' m³' : ''}` : '—',
            status,
            statusKey: normalizedStatus,
            registeredAt: parcel.registeredAt || parcel.createdAt || '',
          };
        }));
        setUsingDemoData(false);
        setError('');
      })
      .catch((loadError) => {
        setRows(DEMO_PARCEL_RECORDS);
        setUsingDemoData(true);
        setError(`API indisponible : ${loadError.message} Les données fictives du template sont affichées.`);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const deleteParcelLocally = (parcel) => {
    if (!window.confirm(`Retirer le colis ${parcel.trackingNumber} de la liste affichée ? Cette action ne sera pas enregistrée dans le backend.`)) {
      return;
    }
    setRows((currentRows) => currentRows.filter((row) => row.id !== parcel.id));
    setActionNotice('Colis retiré de la liste affichée. La suppression n’est pas encore prise en charge par le backend.');
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
      ['status', 'Statut'],
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

  return (
    <div className="parcel-management-page">
      <section className="parcel-management-heading">
        <div>
          <nav aria-label="Fil d’Ariane" className="parcel-management-breadcrumb">
            <span>Opérations</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Gestion des colis</span>
          </nav>
          <h1>Gestion des Colis &amp; Expéditions</h1>
          <p>Surveillez, filtrez et mettez à jour l’ensemble des colis enregistrés sur le corridor Chine – Madagascar.</p>
        </div>
        <div className="parcel-management-heading-actions">
          <button className="parcel-management-button" onClick={exportParcels} type="button">
            <span aria-hidden="true" className="material-symbols-outlined">download</span>
            Exporter CSV / Excel
          </button>
          <Link className="parcel-management-button is-primary" to="/admin/parcels/new">
            <span aria-hidden="true" className="material-symbols-outlined">add</span>
            + Enregistrer un colis
          </Link>
        </div>
      </section>

      <section aria-label="Indicateurs colis" className="parcel-kpi-grid">
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Total corridor actif</span>
            <div className="parcel-kpi-values"><strong>1 428</strong><span className="is-positive">+18% ce mois</span></div>
          </div>
          <div className="parcel-kpi-icon"><span aria-hidden="true" className="material-symbols-outlined">inventory_2</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">En Vol / Transit Mer</span>
            <div className="parcel-kpi-values"><strong>542</strong><span className="is-blue">3 vols / 2 navires</span></div>
          </div>
          <div className="parcel-kpi-icon is-muted"><span aria-hidden="true" className="material-symbols-outlined">flight_takeoff</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Dédouanement Ivato</span>
            <div className="parcel-kpi-values"><strong>116</strong><span>T1 / DAU en cours</span></div>
          </div>
          <div className="parcel-kpi-icon is-customs"><span aria-hidden="true" className="material-symbols-outlined">gavel</span></div>
        </div>
        <div className="parcel-kpi-card">
          <div>
            <span className="parcel-kpi-label">Prêt au retrait TNR</span>
            <div className="parcel-kpi-values"><strong>89</strong><span className="is-positive">Entrepôt Behintsy</span></div>
          </div>
          <div className="parcel-kpi-icon is-ready"><span aria-hidden="true" className="material-symbols-outlined">check_circle</span></div>
        </div>
      </section>

      {usingDemoData && !error && <div className="parcel-data-notice">Données de démonstration fictives — elles ne sont pas enregistrées dans le backend.</div>}
      {error && <div className="parcel-data-error" role="alert">{error}</div>}
      {actionNotice && <div className="parcel-data-notice" role="status">{actionNotice}</div>}

      <ParcelDataTable
        isLoading={isLoading}
        onDelete={deleteParcelLocally}
        onEdit={(parcel) => navigate(`/admin/parcels/${encodeURIComponent(parcel.id)}/edit`)}
        onView={(parcel) => navigate(`/admin/parcels/${encodeURIComponent(parcel.id)}`)}
        rows={rows}
      />
    </div>
  );
}

export function AdminParcelFormPage({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ trackingNumber: '', customerId: '', destination: '', status: 'En préparation' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!edit || !id) return;
    getParcel(id).then((result) => setForm((current) => ({ ...current, ...(result?.data || {}) }))).catch((loadError) => setError(loadError.message));
  }, [edit, id]);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = edit ? await updateParcel(id, form) : await createParcel(form);
      navigate(`/admin/parcels/${encodeURIComponent(result?.data?.id || id || form.trackingNumber)}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeading title={edit ? 'Modifier le colis' : 'Nouveau colis'} description="Les modifications nécessitent un backend API configuré." />
      <div className="admin-demo-notice" style={{ marginBottom: 18 }}>Aucune donnée n’est enregistrée localement. Le formulaire attend le service API sécurisé.</div>
      <section className="admin-card admin-card-body">
        {error && <p className="admin-alert" role="alert">{error}</p>}
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <AdminField label="Numéro de suivi" onChange={setField('trackingNumber')} required value={form.trackingNumber} />
            <AdminField label="ID client" onChange={setField('customerId')} required value={form.customerId} />
            <AdminField label="Destination" onChange={setField('destination')} required value={form.destination} />
            <AdminField as="select" label="Statut" onChange={setField('status')} value={form.status}>
              {['En préparation', 'En transit', 'Arrivé', 'Livré', 'Retardé'].map((status) => <option key={status}>{status}</option>)}
            </AdminField>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <AdminButton disabled={saving} type="submit">{saving ? 'Enregistrement…' : 'Enregistrer'}</AdminButton>
            <AdminButton className="is-secondary" onClick={() => navigate('/admin/parcels')}>Annuler</AdminButton>
          </div>
        </form>
      </section>
    </>
  );
}

export function AdminParcelDetailsPage() {
  const { id } = useParams();
  const [parcel, setParcel] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getParcel(id).then((result) => setParcel(result?.data)).catch((loadError) => setError(loadError.message)); }, [id]);

  return (
    <>
      <PageHeading title="Détail du colis" description={`Référence : ${id}`} action={<AdminButton to={`/admin/parcels/${encodeURIComponent(id)}/edit`}>Modifier</AdminButton>} />
      <section className="admin-card admin-card-body">
        <div className="admin-demo-notice">Détails non chargés depuis un backend. Aucun colis réel n’est exposé.</div>
        {error && <p className="admin-alert" style={{ marginTop: 16 }}>{error}</p>}
        {parcel && <pre style={{ overflow: 'auto', color: '#344054' }}>{JSON.stringify(parcel, null, 2)}</pre>}
        {!parcel && !error && <p className="admin-empty-state">Chargement du détail…</p>}
      </section>
    </>
  );
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
