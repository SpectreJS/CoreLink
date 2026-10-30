import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminBadge, AdminButton, AdminField, AdminTable } from '../components/common/AdminUI.jsx';
import { DEMO_PARCELS, DEMO_DASHBOARD_STATS } from '../data/demoData.js';
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

function statusTone(value) {
  if (/livr|pay|actif|termin/i.test(value)) return 'success';
  if (/transit|cours|attente/i.test(value)) return 'info';
  if (/retard|annul|vérifier/i.test(value)) return 'warning';
  return '';
}

export function AdminDashboardPage() {
  return (
    <>
      <PageHeading title="Dashboard" description="Vue d’ensemble des opérations CoreLink." />
      <p className="admin-demo-notice" style={{ marginBottom: 18 }}>Chiffres et activités ci-dessous : exemples fictifs, non reliés à une base de données.</p>
      <div className="admin-grid">
        {DEMO_DASHBOARD_STATS.map((stat) => (
          <article className="admin-card admin-stat-card" key={stat.label}>
            <div className="admin-stat-top"><span>{stat.label}</span><span className="admin-stat-icon material-symbols-outlined">{stat.icon}</span></div>
            <strong>{stat.value}</strong><small>{stat.change}</small>
          </article>
        ))}
        <section className="admin-card" style={{ gridColumn: 'span 8' }}>
          <div className="admin-card-header"><h2>Activité récente</h2><AdminBadge tone="warning">Exemple</AdminBadge></div>
          <div className="admin-card-body">
            <div aria-label="Graphique d’activité de démonstration" style={{ display: 'flex', height: 180, alignItems: 'end', gap: 12 }}>
              {[34, 52, 41, 70, 56, 88, 63, 76, 48, 94, 68, 82].map((height, index) => (
                <div key={index} style={{ flex: 1, height: `${height}%`, minWidth: 8, borderRadius: '6px 6px 0 0', background: index > 8 ? '#2322F0' : '#00C3F2', opacity: 0.75 }} title={`Période ${index + 1}`} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#7a8495', fontSize: 10 }}><span>Début période</span><span>Fin période</span></div>
          </div>
        </section>
        <section className="admin-card" style={{ gridColumn: 'span 4' }}>
          <div className="admin-card-header"><h2>À traiter</h2></div>
          <div className="admin-card-body" style={{ display: 'grid', gap: 16, color: '#586477', fontSize: 12 }}>
            <span>4 colis à préparer <AdminBadge tone="info">Démo</AdminBadge></span>
            <span>3 paiements à vérifier <AdminBadge tone="warning">Démo</AdminBadge></span>
            <span>2 factures en attente <AdminBadge>Démo</AdminBadge></span>
          </div>
        </section>
        <section className="admin-card" style={{ gridColumn: 'span 12' }}>
          <div className="admin-card-header"><h2>Colis récents</h2><AdminButton className="is-secondary" to="/admin/parcels">Voir les colis</AdminButton></div>
          <AdminTable
            columns={[
              { key: 'tracking', label: 'Référence' },
              { key: 'customer', label: 'Client' },
              { key: 'destination', label: 'Destination' },
              { key: 'status', label: 'Statut', render: (row) => <AdminBadge tone={statusTone(row.status)}>{row.status}</AdminBadge> },
              { key: 'updated', label: 'Mise à jour' },
            ]}
            rows={DEMO_PARCELS.map((parcel, index) => ({ ...parcel, id: String(index) }))}
          />
        </section>
      </div>
    </>
  );
}

export function AdminParcelsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    listParcels().then((result) => setRows(result?.data || [])).catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <>
      <PageHeading title="Gestion des colis" description="Enregistrez, affectez et mettez à jour les colis." action={<AdminButton to="/admin/parcels/new"><span className="material-symbols-outlined">add</span>Nouveau colis</AdminButton>} />
      <div className="admin-demo-notice">La liste API n’est pas encore disponible. Les exemples montrés sur le dashboard sont fictifs.</div>
      <section className="admin-card" style={{ marginTop: 18 }}>
        <div className="admin-card-header"><h2>Colis</h2><AdminBadge>{rows.length} résultat(s)</AdminBadge></div>
        {error && <p className="admin-alert" style={{ margin: 16 }}>{error}</p>}
        <AdminTable columns={[{ key: 'trackingNumber', label: 'Numéro' }, { key: 'status', label: 'Statut' }, { key: 'destination', label: 'Destination' }]} rows={rows.map((row) => ({ ...row, id: row.id || row.trackingNumber }))} emptyMessage="Aucune donnée serveur; le service backend n’est pas encore connecté." />
      </section>
    </>
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
