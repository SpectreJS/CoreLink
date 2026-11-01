import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteParcel, getParcel, listParcelTransportModes } from '../services/parcelService.js';
import { useAdminAuth } from '../contexts/AdminAuthContext.jsx';
import '../styles/admin-parcel-details.scss';
import { formatDateTime } from '../../utils/dateUtils.js';

function formatWeight(value) {
  if (value === undefined || value === null || value === '') return '—';
  return typeof value === 'number' ? `${value} kg` : String(value);
}

function formatVolume(value) {
  if (value === undefined || value === null || value === '') return '—';
  return typeof value === 'number' ? `${value.toFixed(3)} m³` : String(value);
}

function statusTone(status) {
  if (status === 'delivered') return 'delivered';
  if (status === 'ready_for_pickup') return 'ready';
  if (status === 'customs_clearance' || status === 'delayed') return 'customs';
  if (status === 'air_transit' || status === 'sea_transit') return 'transit';
  return 'neutral';
}

function DetailValue({ label, children }) {
  return (
    <div className="parcel-detail-value">
      <span>{label}</span>
      <strong>{children || '—'}</strong>
    </div>
  );
}

function ParcelTimeline({ parcel }) {
  const events = Array.isArray(parcel.trackingEvents)
    ? parcel.trackingEvents.filter((event) => event && typeof event === 'object')
    : [];
  if (!events.length) {
    return (
      <div className="parcel-detail-demo-notice" role="status">
        L’historique de suivi n’est pas fourni par l’API colis actuelle.
      </div>
    );
  }
  return (
    <div className="parcel-detail-timeline">
      {events.map((event, index) => {
        const current = event.isCurrent === true || (!events.some((item) => item.isCurrent === true) && index === events.length - 1);
        return (
          <article className={`parcel-timeline-event ${current ? 'is-current' : 'is-complete'}`} key={event.id || `${event.title || event.status || 'event'}-${index}`}>
            <span aria-hidden="true" className="parcel-timeline-marker">
              <span className="material-symbols-outlined">{current ? 'radio_button_checked' : 'check'}</span>
            </span>
            <div className="parcel-timeline-card">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <strong>{event.title || event.status || 'Événement de suivi'}</strong>
                <span className={`parcel-timeline-state ${current ? 'is-current' : 'is-complete'}`}>{current ? 'En cours' : 'Effectué'}</span>
              </div>
              <div className="parcel-timeline-meta">
                {event.date && <span><span aria-hidden="true" className="material-symbols-outlined">schedule</span>{formatDateTime(event.date)}</span>}
                {event.location && <span><span aria-hidden="true" className="material-symbols-outlined">pin_drop</span>{event.location}</span>}
              </div>
              {event.description && <p>{event.description}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ParcelDetailContent({ parcel, id, canMutate, transportLabel, onDelete }) {
  const weight = formatWeight(parcel.weight);
  const volume = formatVolume(parcel.volume);
  const dimensions = [parcel.length, parcel.width, parcel.height].some((value) => value !== undefined && value !== '')
    ? `${parcel.length || '—'} × ${parcel.width || '—'} × ${parcel.height || '—'} cm`
    : '—';
  const tone = statusTone(parcel.status);
  const organization = parcel.customerName || '—';
  const recipient = parcel.recipientName || parcel.customerName || '—';
  const currentStatus = parcel.statusLabel;

  return (
    <div className="parcel-detail-page">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <Link className="hover:text-secondary" to="/admin/parcels">Colis</Link>
          <span className="text-slate-400">/</span>
          <span>{parcel.trackingNumber}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-800 font-semibold">Fiche d'expédition &amp; Traçabilité</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-outline-variant">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                Détails du Colis {parcel.trackingNumber}
              </h1>
              <span className={`parcel-detail-status is-${tone}`}>
                <span aria-hidden="true" className="parcel-detail-status-dot" />
                {currentStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-surface-container-high text-secondary border border-secondary/20">
                <span aria-hidden="true" className="material-symbols-outlined text-[15px]">{parcel.transportMode === 'sea_lcl' ? 'directions_boat' : 'flight'}</span>
                {transportLabel}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex flex-wrap items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
              Enregistré le {formatDateTime(parcel.registeredAt)} • Hub d'origine : {parcel.origin || '—'} • Destination : {parcel.destination || '—'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canMutate && (
              <>
                <Link className="parcel-detail-action" to={`/admin/parcels/${encodeURIComponent(id)}/edit`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">edit_note</span>
                  Modifier
                </Link>
                <button className="parcel-detail-action" onClick={onDelete} type="button">
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">delete</span>
                  Supprimer
                </button>
              </>
            )}
            <button className="parcel-detail-action" onClick={() => window.print()} type="button">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">print</span>
              Imprimer
            </button>
            <Link className="parcel-detail-action" to="/admin/parcels">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
              Retour
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Résumé du colis" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <article className="parcel-detail-kpi">
          <div className="flex items-center justify-between text-outline mb-1"><span className="font-label-md text-label-md uppercase tracking-wider">Poids Effectif</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">scale</span></div>
          <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{weight}</div>
          <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">Poids enregistré</div>
        </article>
        <article className="parcel-detail-kpi">
          <div className="flex items-center justify-between text-outline mb-1"><span className="font-label-md text-label-md uppercase tracking-wider">Dimensions (CBM)</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">view_in_ar</span></div>
          <div className="font-title-md text-title-md font-bold text-on-surface">{dimensions}</div>
          <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">{volume}{parcel.volumetricWeight ? ` • Poids vol. ${formatWeight(parcel.volumetricWeight)}` : ''}</div>
        </article>
        <article className="parcel-detail-kpi">
          <div className="flex items-center justify-between text-outline mb-1"><span className="font-label-md text-label-md uppercase tracking-wider">Origine / Expéditeur</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">flight_takeoff</span></div>
          <div className="font-title-md text-title-md font-bold text-on-surface truncate">{parcel.origin || '—'}</div>
          <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 truncate">—</div>
        </article>
        <article className="parcel-detail-kpi">
          <div className="flex items-center justify-between text-outline mb-1"><span className="font-label-md text-label-md uppercase tracking-wider">Destinataire Final</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">person_pin_circle</span></div>
          <div className="font-title-md text-title-md font-bold text-on-surface truncate">{recipient}</div>
          <div className="text-[11px] text-on-surface-variant font-medium mt-0.5 truncate">{parcel.destination || '—'}</div>
        </article>
        <article className="parcel-detail-kpi is-highlight col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-outline mb-1"><span className="font-label-md text-label-md uppercase tracking-wider">ETA Ivato (TNR)</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">event_available</span></div>
          <div className="font-headline-sm text-headline-sm font-bold text-secondary">Non renseignée</div>
          <div className="text-[11px] text-outline font-medium mt-0.5">Aucune estimation disponible</div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <article className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <header className="p-4 border-b border-outline-variant flex items-center justify-between gap-3 bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-secondary">verified</span>
                <h2 className="font-title-md text-title-md font-bold text-on-surface">Vérification Physique &amp; Inspection d'Entrepôt</h2>
              </div>
              <span className="font-code-tracking text-code-tracking bg-surface-container px-2 py-0.5 rounded text-on-surface">—</span>
            </header>
            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 relative min-h-64 rounded-lg overflow-hidden border border-outline-variant bg-surface flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 p-6 text-center text-on-surface-variant"><span aria-hidden="true" className="material-symbols-outlined text-4xl">photo_camera</span><span className="text-body-sm">Aucune photo d’inspection n'est enregistrée.</span></div>
                <span className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded text-[11px] font-mono font-bold text-on-surface border border-outline-variant">{weight}</span>
              </div>
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">Validation des Contrôles Réglementaires</h3>
                  <div className="space-y-2">
                    <div className="parcel-inspection-check"><span><span aria-hidden="true" className="material-symbols-outlined">check_circle</span>Poids enregistré</span><strong>{weight}</strong></div>
                    <div className="parcel-inspection-check"><span><span aria-hidden="true" className="material-symbols-outlined">security</span>Scellé de sécurité</span><strong>{parcel.sealNumber || 'Non renseigné'}</strong></div>
                    <div className="parcel-inspection-check"><span><span aria-hidden="true" className="material-symbols-outlined">fact_check</span>Statut actuel</span><strong>{currentStatus}</strong></div>
                  </div>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-outline-variant text-xs space-y-1">
                  <DetailValue label="Désignation :">{parcel.description}</DetailValue>
                  <DetailValue label="Catégorie :">{parcel.category}</DetailValue>
                  <DetailValue label="Nombre de colis :">{parcel.packageCount}</DetailValue>
                  <DetailValue label="Opérateur de contrôle :">—</DetailValue>
                  <DetailValue label="Bordereau étiqueté :">{parcel.trackingNumber}</DetailValue>
                  <DetailValue label="Instructions de manipulation :">{parcel.notes || '—'}</DetailValue>
                </div>
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5 space-y-5">
            <header className="flex items-center justify-between gap-3 pb-3 border-b border-outline-variant">
              <div className="space-y-0.5">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-secondary">timeline</span>Traçabilité Opérationnelle &amp; Chronologie Complète</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Suivi multi-segments entre {parcel.origin || 'le hub d’origine'} et {parcel.destination || 'la destination'}</p>
              </div>
              <span className="px-2.5 py-1 bg-surface-container-high text-secondary rounded font-mono text-xs font-bold">{Array.isArray(parcel.trackingEvents) ? parcel.trackingEvents.length : 0} ÉTAPES</span>
            </header>
            <ParcelTimeline parcel={parcel} />
          </article>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <article className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-4">
            <header className="flex items-center justify-between gap-2 pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-secondary">person</span><h3 className="font-title-md text-title-md font-bold text-on-surface">Client &amp; Destinataire</h3></div>
              <span className="text-xs bg-surface-container text-on-surface-variant font-semibold px-2 py-0.5 rounded">Coordonnées du colis</span>
            </header>
            <div className="space-y-3">
              <div><span className="text-xs text-outline uppercase font-semibold">Nom de l'organisation / Contact</span><h4 className="font-title-md text-title-md font-bold text-on-surface">{organization}</h4><p className="text-body-sm text-on-surface-variant">Aucun compte client distinct n'est associé à ce colis.</p></div>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center"><span aria-hidden="true" className="material-symbols-outlined text-[18px]">chat</span></div>
                  <div className="min-w-0"><span className="text-xs text-outline block">Téléphone / WhatsApp</span><strong className="font-mono text-sm text-on-surface">{parcel.phone || '—'}</strong></div>
                </div>
                {parcel.phone && <a aria-label="Ouvrir WhatsApp" className="p-1.5 hover:bg-surface-container-high rounded text-secondary transition-colors" href={`https://wa.me/${parcel.phone.replace(/\D/g, '')}`} rel="noreferrer" target="_blank"><span aria-hidden="true" className="material-symbols-outlined">send</span></a>}
              </div>
              <div className="space-y-1 text-body-sm">
                <span className="text-xs text-outline uppercase font-semibold">Destinataire et destination</span>
                <p className="text-on-surface font-medium">{parcel.recipientName || '—'} • {parcel.destination || '—'}</p>
                {parcel.email && <p className="text-on-surface-variant text-xs">{parcel.email}</p>}
              </div>
            </div>
          </article>

          <article className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-3">
            <header className="flex items-center justify-between gap-2 pb-2 border-b border-outline-variant"><div className="flex items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-secondary">attachment</span><h3 className="font-title-md text-title-md font-bold text-on-surface">Documents Attachés</h3></div></header>
            <p className="text-body-sm text-on-surface-variant">Le backend ne prend pas encore en charge le stockage des documents.</p>
          </article>

          <article className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4 space-y-3">
            <header className="flex items-center justify-between gap-2 pb-2 border-b border-outline-variant"><div className="flex items-center gap-2"><span aria-hidden="true" className="material-symbols-outlined text-secondary">sms</span><h3 className="font-title-md text-title-md font-bold text-on-surface">Historique Notifications</h3></div></header>
            <p className="text-body-sm text-on-surface-variant">Aucun service de notification ni historique de notification n'est disponible dans le backend.</p>
          </article>
        </div>
      </section>

      <section className="mt-8 pt-4 pb-6 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between text-xs text-outline gap-3">
        <div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Données du colis</span><span>•</span><span>Référence : {parcel.trackingNumber}</span></div>
        <Link className="text-secondary hover:underline" to="/admin/parcels">Retour à la gestion des colis</Link>
      </section>
    </div>
  );
}

export default function AdminParcelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [parcel, setParcel] = useState(null);
  const [transportModes, setTransportModes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const canMutate = ['admin', 'manager', 'operator'].includes(user?.role);

  useEffect(() => {
    let active = true;
    setParcel(null);
    setError('');
    setIsLoading(true);
    Promise.all([getParcel(id), listParcelTransportModes()])
      .then(([result, modes]) => {
        if (!result?.data || !Array.isArray(modes?.data)) throw new Error('Réponse API invalide lors du chargement du colis.');
        if (active) {
          setParcel(result.data);
          setTransportModes(modes.data);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Impossible de charger ce colis.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  const removeParcel = async () => {
    if (!window.confirm(`Supprimer définitivement le colis ${parcel.trackingNumber} ?`)) return;
    setActionError('');
    try {
      await deleteParcel(id);
      navigate('/admin/parcels', { state: { notice: `Le colis ${parcel.trackingNumber} a été supprimé.` } });
    } catch (deleteError) {
      setActionError(deleteError.message || 'La suppression du colis a échoué.');
    }
  };

  if (isLoading) {
    return <div aria-live="polite" className="parcel-detail-state"><span className="material-symbols-outlined">progress_activity</span><strong>Chargement des détails du colis…</strong></div>;
  }

  if (error || !parcel) {
    return (
      <div className="parcel-detail-state is-error" role="alert">
        <span aria-hidden="true" className="material-symbols-outlined">error</span>
        <strong>{error || 'Ce colis est introuvable.'}</strong>
        <Link className="parcel-detail-action" to="/admin/parcels"><span aria-hidden="true" className="material-symbols-outlined">arrow_back</span>Retour à la gestion des colis</Link>
      </div>
    );
  }

  const transportLabel = transportModes.find(({ value }) => value === parcel.transportMode)?.label || parcel.transportMode;
  return (
    <>
      {actionError && <p className="admin-alert mb-4" role="alert">{actionError}</p>}
      <ParcelDetailContent canMutate={canMutate} id={id} onDelete={removeParcel} parcel={parcel} transportLabel={transportLabel} />
    </>
  );
}
