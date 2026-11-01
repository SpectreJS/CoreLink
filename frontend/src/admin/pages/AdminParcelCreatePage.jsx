import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createParcel, getParcel, listParcelStatuses, listParcelTransportModes, updateParcel } from '../services/parcelService.js';
import '../styles/admin-parcel-create.scss';

const initialForm = {
  trackingNumber: '',
  description: '',
  category: '',
  packageCount: '1',
  sealNumber: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  customerName: '',
  recipientName: '',
  phone: '',
  email: '',
  taxId: '',
  origin: '',
  destination: '',
  transportMode: '',
  status: '',
  notes: '',
};

const transportIcons = {
  air_regular: 'flight_takeoff',
  air_express: 'rocket_launch',
  sea_lcl: 'directions_boat',
};

function ParcelSectionHeading({ icon, children, trailing }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-outline-variant">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <h2 className="text-title-md font-title-md text-on-surface font-bold">{children}</h2>
      </div>
      {trailing}
    </div>
  );
}

function ParcelField({ children, className = '', htmlFor }) {
  return (
    <div className={className}>
      <label className="block text-label-md font-label-md text-on-surface mb-1.5" htmlFor={htmlFor}>
        {children}
      </label>
    </div>
  );
}

function ParcelInput({ field, form, setField, className, ...props }) {
  return (
    <input
      className={className || 'w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15'}
      id={field}
      onChange={setField(field)}
      value={form[field]}
      {...props}
    />
  );
}

export default function AdminParcelCreatePage({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [statuses, setStatuses] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(edit);

  const length = Number(form.length) || 0;
  const width = Number(form.width) || 0;
  const height = Number(form.height) || 0;
  const actualWeight = Number(form.weight) || 0;
  const volumeCm = length * width * height;
  const volumetricWeight = volumeCm / 5000;
  const volumeCbm = volumeCm / 1000000;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([
      listParcelStatuses(),
      listParcelTransportModes(),
      edit ? getParcel(id) : Promise.resolve(null),
    ])
      .then(([statusResult, transportResult, parcelResult]) => {
        if (!Array.isArray(statusResult?.data) || !Array.isArray(transportResult?.data)) {
          throw new Error('Les options de gestion des colis reçues de l’API sont invalides.');
        }
        if (active) {
          setStatuses(statusResult.data);
          setTransportModes(transportResult.data);
          if (edit) {
            if (!parcelResult?.data) throw new Error('Colis introuvable.');
            const parcel = parcelResult.data;
            setForm(Object.fromEntries(Object.keys(initialForm).map((field) => [
              field,
              parcel[field] == null ? '' : String(parcel[field]),
            ])));
          }
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Impossible de charger le formulaire colis.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [edit, id]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    setSaving(true);
    try {
      const payload = {
        trackingNumber: form.trackingNumber.trim(),
        description: form.description.trim(),
        category: form.category,
        packageCount: Number(form.packageCount),
        sealNumber: form.sealNumber || null,
        weight: Number(form.weight),
        length: Number(form.length) || 0,
        width: Number(form.width) || 0,
        height: Number(form.height) || 0,
        customerName: form.customerName.trim(),
        recipientName: form.recipientName || null,
        phone: form.phone.trim(),
        email: form.email.trim(),
        taxId: form.taxId || null,
        origin: form.origin,
        destination: form.destination,
        transportMode: form.transportMode,
        notes: form.notes || null,
      };
      if (edit) payload.status = form.status;
      const result = edit ? await updateParcel(id, payload) : await createParcel(payload);
      navigate('/admin/parcels', {
        state: { notice: edit ? `Le colis ${result?.data?.trackingNumber || form.trackingNumber} a été modifié.` : `Le colis ${result?.data?.trackingNumber} a été créé.` },
      });
    } catch (saveError) {
      setError(saveError.message || 'Enregistrement du colis impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="parcel-create-page">
      <div className="px-6 py-6">
        <div className="mb-6">
          <div className="parcel-create-heading">
            <div>
              <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{edit ? `Modifier le colis ${form.trackingNumber}` : 'Enregistrer un nouveau colis'}</h1>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Saisissez les informations techniques, douanières et logistiques du fret réceptionné.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-secondary-fixed">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-label-md font-label-md text-on-secondary-fixed-variant">Hub de Transit Baiyun GZ Connecté</span>
            </div>
          </div>
        </div>

        {error && <p className="admin-alert mb-5" role="alert">{error}</p>}
        {isLoading && <p aria-live="polite" className="mb-5 text-on-surface-variant">Chargement des données du colis…</p>}

        <form className="space-y-6" id="parcel-form" onSubmit={submit}>
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="label">1. Informations Générales du Colis</ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <ParcelField className="md:col-span-4" htmlFor="trackingNumber">
                Numéro de suivi <span className="text-error">*</span>
                <span className="relative mt-1.5 block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
                  </span>
                  <input className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-code-tracking font-code-tracking text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15" id="trackingNumber" onChange={setField('trackingNumber')} pattern="CL-[0-9]{4}" placeholder="Ex : CL-0001" required value={form.trackingNumber} />
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-1 block">Format attendu : CL-0001.</span>
              </ParcelField>
              <ParcelField className="md:col-span-8" htmlFor="description">
                Nom / Désignation commerciale du colis <span className="text-error">*</span>
                <ParcelInput field="description" form={form} required setField={setField} />
              </ParcelField>
              <ParcelField className="md:col-span-6" htmlFor="category">
                Catégorie marchande douanière <span className="text-error">*</span>
                <span className="relative block">
                  <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 appearance-none" id="category" onChange={setField('category')} required value={form.category}>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="dg">Électronique sensible (PCB, Microcontrôleurs)</option>
                    <option value="gen">Marchandises Générales (Textile, Articles ménagers)</option>
                    <option value="battery">Produits avec Batterie / DG (Dangerous Goods UN3481)</option>
                    <option value="cosmetics">Cosmétiques &amp; Parfumerie</option>
                    <option value="liquids">Liquides &amp; Poudres certifiées</option>
                  </select>
                  <span aria-hidden="true" className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">expand_more</span></span>
                </span>
              </ParcelField>
              <ParcelField className="md:col-span-3" htmlFor="packageCount">
                Nombre de colis / cartons <span className="text-error">*</span>
                <ParcelInput field="packageCount" form={form} min="1" required setField={setField} type="number" />
              </ParcelField>
              <ParcelField className="md:col-span-3" htmlFor="sealNumber">
                N° Ruban de sécurité scellé
                <ParcelInput field="sealNumber" form={form} setField={setField} type="text" />
              </ParcelField>
              {edit && (
                <ParcelField className="md:col-span-6" htmlFor="status">
                  Statut du colis
                  <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface" id="status" onChange={setField('status')} required value={form.status}>
                    {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </ParcelField>
              )}
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading
              icon="scale"
              trailing={(
                <div className="flex items-center gap-2">
                  <span className="text-label-sm font-label-sm text-on-surface-variant">Ratio Aérien:</span>
                  <span className="text-label-md font-label-md px-2 py-0.5 bg-surface-container text-secondary rounded">1:5000</span>
                </div>
              )}
            >
              2. Poids et Dimensions (Calcul volumétrique automatique)
            </ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              <ParcelField className="md:col-span-3" htmlFor="weight">
                Poids réel constaté (kg) <span className="text-error">*</span>
                <span className="relative block">
                  <ParcelInput className="w-full pl-3 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-title-md font-title-md font-bold text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15" field="weight" form={form} min="0.01" required setField={setField} step="0.01" type="number" />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-body-sm font-body-sm text-outline font-semibold">kg</span>
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-1 flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-[13px] text-tertiary-container">check_circle</span>
                  Mettler Toledo GZ étalonné
                </span>
              </ParcelField>
              {[
                ['length', 'Longueur L (cm)'],
                ['width', 'Largeur l (cm)'],
                ['height', 'Hauteur H (cm)'],
              ].map(([field, label]) => (
                <ParcelField className="md:col-span-2" htmlFor={field} key={field}>
                  {label}
                  <span className="relative block">
                    <ParcelInput className="w-full pl-3 pr-9 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15" field={field} form={form} min="0" setField={setField} type="number" />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-body-sm font-body-sm text-outline">cm</span>
                  </span>
                </ParcelField>
              ))}
              <div className="md:col-span-3">
                <div aria-live="polite" className="bg-surface-container-high border border-secondary-fixed rounded-xl p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Poids Volumétrique:</span>
                    <span className="text-title-sm font-title-sm font-bold text-secondary">{volumetricWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Volume (CBM):</span>
                    <span className="text-label-md font-label-md font-bold px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface">{volumeCbm.toFixed(3)} m³</span>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-outline-variant/60 flex items-center justify-between text-label-sm font-label-sm text-secondary font-semibold">
                    <span>Base de facturation:</span>
                    <span className="font-bold underline">{chargeableWeight.toFixed(2)} kg ({volumetricWeight > actualWeight ? 'Vol.' : 'Réel'})</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="person_pin">
              3. Informations Client &amp; Expéditeur
            </ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <ParcelField className="md:col-span-6" htmlFor="customerName">
                Nom du client <span className="text-error">*</span>
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">badge</span></span>
                  <ParcelInput className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15" field="customerName" form={form} required setField={setField} />
                </span>
              </ParcelField>
              <ParcelField className="md:col-span-6" htmlFor="recipientName">
                Nom complet du contact réceptionnaire
                <ParcelInput field="recipientName" form={form} setField={setField} type="text" />
              </ParcelField>
              <ParcelField className="md:col-span-4" htmlFor="phone">
                Téléphone / WhatsApp Réception <span className="text-error">*</span>
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">call</span></span>
                  <ParcelInput className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" field="phone" form={form} required setField={setField} type="tel" />
                </span>
              </ParcelField>
              <ParcelField className="md:col-span-4" htmlFor="email">
                Adresse e-mail de notification
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">mail</span></span>
                  <ParcelInput className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" field="email" form={form} setField={setField} type="email" />
                </span>
              </ParcelField>
              <ParcelField className="md:col-span-4" htmlFor="taxId">
                Pièce d'identité / NIF-STAT Douanes
                <ParcelInput className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" field="taxId" form={form} setField={setField} type="text" />
              </ParcelField>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="alt_route">4. Acheminement &amp; Mode de Transport</ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <ParcelField className="md:col-span-6" htmlFor="origin">
                Hub d'origine (Point de collecte Chine) <span className="text-error">*</span>
                <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" id="origin" onChange={setField('origin')} required value={form.origin}>
                  <option value="">Sélectionner un hub</option>
                  <option>Yiwu Consolidation Center (YIW)</option>
                  <option>Shenzhen Bao'an Cross-dock (SZX)</option>
                  <option>Guangzhou Hub Baiyun (CAN) — Entrepôt Principal</option>
                </select>
              </ParcelField>
              <ParcelField className="md:col-span-6" htmlFor="destination">
                Destination finale (Dépôt Madagascar) <span className="text-error">*</span>
                <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" id="destination" onChange={setField('destination')} required value={form.destination}>
                  <option value="">Sélectionner une destination</option>
                  <option>Antananarivo — Dépôt Central Behintsy (TNR)</option>
                  <option>Toamasina — Dépôt Maritime Port (TMM)</option>
                  <option>Majunga — Agence Régionale Ouest (MJN)</option>
                </select>
              </ParcelField>
              <div className="md:col-span-8">
                <span className="block text-label-md font-label-md text-on-surface mb-2">Mode d'expédition préconisé</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {transportModes.map((choice) => (
                    <label className={`parcel-transport-choice ${form.transportMode === choice.value ? 'is-selected' : ''}`} key={choice.value}>
                      <span className="flex items-center justify-between mb-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[22px]">{transportIcons[choice.value] || 'local_shipping'}</span>
                        <input checked={form.transportMode === choice.value} className="text-secondary focus:ring-secondary h-4 w-4" name="shipping-mode" onChange={setField('transportMode')} required type="radio" value={choice.value} />
                      </span>
                      <span className="text-title-sm font-title-sm text-on-surface font-semibold">{choice.label}</span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">{choice.value.replaceAll('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <ParcelField className="md:col-span-4" htmlFor="eta">
                Date estimée d'arrivée (ETA Ivato TNR)
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">calendar_today</span></span>
                  <input className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface font-semibold" id="eta" readOnly value="Non renseignée par le backend" />
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-1.5">Aucune estimation réelle n'est disponible.</span>
              </ParcelField>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="verified_user">5. Documents, Photos de contrôle &amp; Inspection</ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-6 flex flex-col gap-3">
                <label className="block text-label-md font-label-md text-on-surface">
                  Photo de réception &amp; contrôle de pesée
                </label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 bg-surface-container-low flex flex-col items-center justify-center text-center">
                  <div className="relative w-full h-52 rounded-lg overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 px-4 text-on-surface-variant">
                      <span aria-hidden="true" className="material-symbols-outlined text-4xl">add_a_photo</span>
                      <span className="text-label-sm">Le backend ne prend pas encore en charge le stockage des photos.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="block text-label-md font-label-md text-on-surface mb-1.5">Pièces jointes douanières (Facture 1688 / Taobao, Packing List)</span>
                  <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-lowest space-y-2">
                    <div className="w-full py-2 border-2 border-dashed border-outline-variant rounded-lg text-label-md text-on-surface-variant flex items-center justify-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">upload_file</span>
                      Téléversement non disponible
                    </div>
                    <p className="text-label-sm text-on-surface-variant">Aucun endpoint backend ne permet actuellement d'enregistrer ces fichiers.</p>
                  </div>
                </div>
                <ParcelField htmlFor="notes">
                  Notes internes &amp; consignes particulières pour Madagascar
                  <textarea className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" id="notes" onChange={setField('notes')} placeholder="Ex: Fragile, scellé de sécurité apposé, vérifier intégrité des composants à l'arrivée Behintsy..." rows="3" value={form.notes} />
                </ParcelField>
              </div>
            </div>
          </section>

          <div className="parcel-create-actions">
            <button className="parcel-create-secondary" disabled={saving} onClick={() => navigate('/admin/parcels')} type="button">Annuler</button>
            <button className="parcel-create-primary" disabled={saving || isLoading || transportModes.length === 0} type="submit">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">save</span>
              {saving ? 'Enregistrement…' : edit ? 'Enregistrer les modifications' : 'Enregistrer le colis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
