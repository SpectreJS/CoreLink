import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createParcel } from '../services/parcelService.js';
import { listCustomers } from '../services/customerService.js';
import '../styles/admin-parcel-create.scss';

const initialForm = {
  trackingNumber: `CL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  description: '',
  category: 'dg',
  packageCount: '1',
  sealNumber: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  customerId: '',
  customerName: '',
  recipientName: '',
  phone: '',
  email: '',
  taxId: '',
  origin: 'Guangzhou Hub Baiyun (CAN) — Entrepôt Principal',
  destination: 'Antananarivo — Dépôt Central Behintsy (TNR)',
  transportMode: 'air_regular',
  status: 'En préparation',
  notes: '',
};

const transportChoices = [
  { value: 'air_regular', label: 'Fret Aérien Régulier', detail: 'Délai estimé: 7 - 10 jours', icon: 'flight_takeoff' },
  { value: 'air_express', label: 'Aérien Express VIP', detail: 'Délai: 4 - 6 jours', icon: 'rocket_launch' },
  { value: 'sea_lcl', label: 'Maritime Groupage LCL', detail: 'Délai: 35 - 45 jours', icon: 'directions_boat' },
];

const getCustomerName = (customer) => customer.name || customer.fullName || customer.companyName || customer.email || '';

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

export default function AdminParcelCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [customerError, setCustomerError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [photoPreview, setPhotoPreview] = useState('');

  const length = Number(form.length) || 0;
  const width = Number(form.width) || 0;
  const height = Number(form.height) || 0;
  const actualWeight = Number(form.weight) || 0;
  const volumeCm = length * width * height;
  const volumetricWeight = volumeCm / 5000;
  const volumeCbm = volumeCm / 1000000;
  const chargeableWeight = Math.max(actualWeight, volumetricWeight);
  const eta = useMemo(() => {
    const estimatedDate = new Date();
    const estimatedDays = form.transportMode === 'sea_lcl' ? 40 : form.transportMode === 'air_express' ? 5 : 8;
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(estimatedDate);
  }, [form.transportMode]);

  useEffect(() => {
    let active = true;
    listCustomers()
      .then((result) => {
        if (!Array.isArray(result?.data)) {
          throw new Error('La réponse de la liste des clients est invalide.');
        }
        if (active) setCustomers(result.data.filter((customer) => customer?.id != null && getCustomerName(customer)));
      })
      .catch((loadError) => {
        if (active) setCustomerError(`Liste des clients indisponible : ${loadError.message}`);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectCustomer = (event) => {
    const customerName = event.target.value;
    const selectedCustomer = customers.find((customer) => getCustomerName(customer) === customerName);
    setForm((current) => ({
      ...current,
      customerName,
      customerId: selectedCustomer ? String(selectedCustomer.id) : '',
      phone: selectedCustomer?.phone || current.phone,
      email: selectedCustomer?.email || current.email,
      recipientName: selectedCustomer?.contactName || current.recipientName,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.customerId) {
      setError('Sélectionnez un client enregistré dans la liste pour associer le colis à son compte.');
      return;
    }
    if (!photo) {
      setError('Ajoutez une photo de réception et de contrôle de pesée.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        packageCount: Number(form.packageCount),
        weight: Number(form.weight),
        length: Number(form.length) || 0,
        width: Number(form.width) || 0,
        height: Number(form.height) || 0,
        volumetricWeight: Number(volumetricWeight.toFixed(2)),
        volume: Number(volumeCbm.toFixed(3)),
        chargeableWeight: Number(chargeableWeight.toFixed(2)),
        inspectionPhotoName: photo.name,
        documentNames: documents.map((document) => document.name),
        eta,
      };
      const result = await createParcel(payload);
      const parcelId = result?.data?.id || result?.data?.trackingNumber || form.trackingNumber;
      navigate(`/admin/parcels/${encodeURIComponent(parcelId)}`);
    } catch (saveError) {
      setError(saveError.message || 'Enregistrement du colis impossible.');
    } finally {
      setSaving(false);
    }
  };

  const addDocuments = (event) => {
    const selected = Array.from(event.target.files || []);
    setDocuments((current) => [
      ...current,
      ...selected.filter((file) => !current.some((existing) => existing.name === file.name && existing.size === file.size)),
    ]);
    event.target.value = '';
  };

  const removeDocument = (indexToRemove) => {
    setDocuments((current) => current.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="parcel-create-page">
      <div className="px-6 py-6">
        <div className="mb-6">
          <nav aria-label="Fil d’Ariane" className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-2">
            <Link className="hover:text-secondary flex items-center gap-1" to="/admin/parcels">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">inventory_2</span>
              Colis
            </Link>
            <span aria-hidden="true" className="text-outline">/</span>
            <span aria-current="page" className="text-secondary font-semibold">Nouvel enregistrement</span>
          </nav>
          <div className="parcel-create-heading">
            <div>
              <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Enregistrer un nouveau colis</h1>
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

        <form className="space-y-6" id="parcel-form" onSubmit={submit}>
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="label">1. Informations Générales du Colis</ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <ParcelField className="md:col-span-4" htmlFor="trackingNumber">
                Numéro de suivi (AWB / Code Interne)
                <span className="relative mt-1.5 block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <ParcelInput
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-code-tracking font-code-tracking text-secondary font-bold cursor-not-allowed"
                    field="trackingNumber"
                    form={form}
                    readOnly
                    setField={setField}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-label-sm font-label-sm text-outline">Généré auto</span>
                </span>
              </ParcelField>
              <ParcelField className="md:col-span-8" htmlFor="description">
                Nom / Désignation commerciale du colis <span className="text-error">*</span>
                <ParcelInput field="description" form={form} required setField={setField} />
              </ParcelField>
              <ParcelField className="md:col-span-6" htmlFor="category">
                Catégorie marchande douanière <span className="text-error">*</span>
                <span className="relative block">
                  <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 appearance-none" id="category" onChange={setField('category')} required value={form.category}>
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
            <ParcelSectionHeading
              icon="person_pin"
              trailing={(
                <Link className="text-label-md font-label-md text-secondary hover:underline flex items-center gap-1" to="/admin/customers/new">
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">person_add</span>
                  Créer un nouveau client
                </Link>
              )}
            >
              3. Informations Client &amp; Expéditeur
            </ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <ParcelField className="md:col-span-6" htmlFor="customerName">
                Client destinataire (Recherche autocomplétée) <span className="text-error">*</span>
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">badge</span></span>
                  <input autoComplete="off" className="w-full pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15" id="customerName" list="parcel-customers" onChange={selectCustomer} required value={form.customerName} />
                  <datalist id="parcel-customers">{customers.map((customer) => <option key={customer.id} value={getCustomerName(customer)} />)}</datalist>
                  <span aria-hidden="true" className={`absolute inset-y-0 right-0 flex items-center pr-3 ${form.customerId ? 'text-secondary' : 'text-outline'}`}><span className="material-symbols-outlined text-[18px]">{form.customerId ? 'verified' : 'search'}</span></span>
                </span>
                {customerError && <span className="mt-1 block text-label-sm text-error">{customerError}</span>}
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
                Hub d'origine (Point de collecte Chine)
                <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" id="origin" onChange={setField('origin')} value={form.origin}>
                  <option>Guangzhou Hub Baiyun (CAN) — Entrepôt Principal</option>
                  <option>Yiwu Consolidation Center (YIW)</option>
                  <option>Shenzhen Bao'an Cross-dock (SZX)</option>
                </select>
              </ParcelField>
              <ParcelField className="md:col-span-6" htmlFor="destination">
                Destination finale (Dépôt Madagascar)
                <select className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:border-secondary" id="destination" onChange={setField('destination')} value={form.destination}>
                  <option>Antananarivo — Dépôt Central Behintsy (TNR)</option>
                  <option>Toamasina — Dépôt Maritime Port (TMM)</option>
                  <option>Majunga — Agence Régionale Ouest (MJN)</option>
                </select>
              </ParcelField>
              <div className="md:col-span-8">
                <span className="block text-label-md font-label-md text-on-surface mb-2">Mode d'expédition préconisé</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {transportChoices.map((choice) => (
                    <label className={`parcel-transport-choice ${form.transportMode === choice.value ? 'is-selected' : ''}`} key={choice.value}>
                      <span className="flex items-center justify-between mb-1">
                        <span aria-hidden="true" className="material-symbols-outlined text-secondary text-[22px]">{choice.icon}</span>
                        <input checked={form.transportMode === choice.value} className="text-secondary focus:ring-secondary h-4 w-4" name="shipping-mode" onChange={setField('transportMode')} type="radio" value={choice.value} />
                      </span>
                      <span className="text-title-sm font-title-sm text-on-surface font-semibold">{choice.label}</span>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">{choice.detail}</span>
                    </label>
                  ))}
                </div>
              </div>
              <ParcelField className="md:col-span-4" htmlFor="eta">
                Date estimée d'arrivée (ETA Ivato TNR)
                <span className="relative block">
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">calendar_today</span></span>
                  <input className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md font-body-md text-on-surface font-semibold" id="eta" readOnly value={`${eta} (Estimée)`} />
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant mt-1.5">Estimée selon le mode de transport sélectionné</span>
              </ParcelField>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <ParcelSectionHeading icon="verified_user">5. Documents, Photos de contrôle &amp; Inspection</ParcelSectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-6 flex flex-col gap-3">
                <label className="block text-label-md font-label-md text-on-surface">
                  Photo de réception &amp; contrôle de pesée effectuée <span className="text-error">*</span>
                </label>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-4 bg-surface-container-low flex flex-col items-center justify-center text-center">
                  <div className="relative w-full h-52 rounded-lg overflow-hidden bg-surface-container border border-outline-variant flex items-center justify-center">
                    {photoPreview
                      ? <img alt={`Aperçu de ${photo.name}`} className="w-full h-full object-cover" src={photoPreview} />
                      : (
                        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                          <span aria-hidden="true" className="material-symbols-outlined text-4xl">add_a_photo</span>
                          <span className="text-label-sm">Sélectionnez une photo du colis pesé</span>
                        </div>
                      )}
                    {photo && (
                      <div className="absolute bottom-2 left-2 right-2 bg-on-background/80 backdrop-blur-sm px-3 py-1.5 rounded text-left flex items-center justify-between">
                        <span className="text-on-secondary text-label-sm font-label-sm truncate">{photo.name}</span>
                        <span className="text-tertiary-fixed text-label-sm font-label-sm font-bold">Sélectionnée</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="px-3 py-1 bg-surface-container-lowest border border-outline-variant text-label-md font-label-md rounded text-on-surface hover:bg-surface-container cursor-pointer">
                      {photo ? 'Remplacer l’image' : 'Ajouter une photo'}
                      <input accept="image/*" className="sr-only" onChange={(event) => setPhoto(event.target.files?.[0] || null)} type="file" />
                    </label>
                    {photo && <button className="px-3 py-1 text-label-md font-label-md text-error hover:bg-error-container rounded" onClick={() => setPhoto(null)} type="button">Supprimer</button>}
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="block text-label-md font-label-md text-on-surface mb-1.5">Pièces jointes douanières (Facture 1688 / Taobao, Packing List)</span>
                  <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-lowest space-y-2">
                    {documents.map((document, index) => (
                      <div className="flex items-center justify-between gap-2 p-2 rounded bg-surface-container-low border border-outline-variant" key={`${document.name}-${document.size}-${index}`}>
                        <div className="flex min-w-0 items-center gap-2">
                          <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-secondary">{document.type === 'application/pdf' ? 'picture_as_pdf' : 'draft'}</span>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-label-md font-label-md text-on-surface truncate">{document.name}</span>
                            <span className="text-label-sm font-label-sm text-on-surface-variant">{Math.max(1, Math.round(document.size / 1024))} KB</span>
                          </div>
                        </div>
                        <button aria-label={`Retirer ${document.name}`} className="text-outline hover:text-error" onClick={() => removeDocument(index)} type="button">
                          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                    <label className="w-full py-2 border-2 border-dashed border-outline-variant rounded-lg text-label-md font-label-md text-on-surface-variant hover:text-secondary hover:border-secondary flex items-center justify-center gap-2 cursor-pointer">
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">upload_file</span>
                      Téléverser une facture ou bordereau
                      <input accept=".pdf,.png,.jpg,.jpeg,.webp" className="sr-only" multiple onChange={addDocuments} type="file" />
                    </label>
                    <p className="text-label-sm text-on-surface-variant">Les fichiers sont sélectionnés localement ; le service API actuel ne transmet pas leur contenu.</p>
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
            <button className="parcel-create-primary" disabled={saving} type="submit">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">save</span>
              {saving ? 'Enregistrement…' : 'Enregistrer le colis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
