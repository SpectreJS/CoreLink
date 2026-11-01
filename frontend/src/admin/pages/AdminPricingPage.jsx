import React, { useEffect, useMemo, useState } from 'react';
import { listPricingSettings, updatePricingSetting } from '../services/pricingService.js';

const categories = [
  {
    icon: 'category',
    tone: 'bg-blue-50 text-secondary',
    name: 'Marchandises Générales',
    description: 'Vêtements, chaussures, quincaillerie standard',
    air: '70 000 – 75 000 Ar / kg',
    sea: '355 USD / m³',
    delay: '5–7j (Air) | 35j (Mer)',
    note: 'Dédouanement groupé standard Ivato TNR, zéro restriction ADR.',
    status: 'Actif',
  },
  {
    icon: 'smartphone',
    tone: 'bg-indigo-50 text-secondary',
    name: 'Électronique sensible & Smartphones',
    description: 'Smartphones neufs/reconditionnés, tablettes, laptops',
    air: '80 000 – 100 000 Ar / pièce',
    sea: 'Sur cotation spéciale',
    delay: '6–8j (Air sécurisé)',
    note: 'Enregistrement IMEI requis en douane Ivato + Scellé inviolable.',
    status: 'Actif',
  },
  {
    icon: 'battery_charging_full',
    tone: 'bg-amber-50 text-amber-700',
    name: 'Batteries & Matières Spéciales DG',
    description: 'Powerbanks, accus lithium-ion, hoverboards',
    air: '100 000 – 120 000 Ar / kg',
    sea: '400 – 420 USD / m³',
    delay: '8–12j (Vol Cargo DG)',
    note: 'Déclaration UN3480/UN3481, bordereau MSDS exigé à Guangzhou.',
    status: 'Contrôlé',
  },
  {
    icon: 'sanitizer',
    tone: 'bg-rose-50 text-rose-600',
    name: 'Cosmétiques & Liquides',
    description: 'Sérums, parfums, huiles corporelles, gels',
    air: '75 000 – 95 000 Ar / kg',
    sea: '375 USD / m³',
    delay: '7–10j (Ligne dédiée)',
    note: 'Emballage étanche obligatoire anti-fuite. Agrément sanitaire.',
    status: 'Actif',
  },
  {
    icon: 'directions_car',
    tone: 'bg-slate-100 text-on-surface',
    name: 'Pièces automobiles & Métallurgie lourde',
    description: "Moteurs, amortisseurs, jantes, machinerie d'atelier",
    air: '70 000 Ar / kg (> 50kg)',
    sea: '320 – 340 USD / m³ (Pondéré)',
    delay: '35–45j (Maritime groupé)',
    note: 'Mise en caisse bois traitée NIMP15 pour transport par mer.',
    status: 'Actif',
  },
];

const quotations = [
  ['DEV-2025-0841', 'Aérien (24 kg)', 'Société Malagasy Import / Tantely R.', '1 800 000 MGA', 'En attente'],
  ['DEV-2025-0839', 'Maritime (1.8 CBM)', 'Hery Distribution SARL', '657 USD (~ 3.05M Ar)', 'Accepté'],
  ['DEV-2025-0838', 'Aérien DG (6.2 kg)', 'TechZone Antanimena', '682 000 MGA', 'Accepté'],
  ['DEV-2025-0835', 'Maritime (0.4 CBM)', 'Boutique Ravina Behoririka', '146 USD (~ 678K Ar)', 'En attente'],
];

function Icon({ children, className = '' }) {
  return <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function PricingCard({ label, title, icon, value, unit, badge, description, tone = 'text-secondary', onEdit }) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="block text-label-md font-label-md uppercase tracking-wider text-on-surface-variant">{label}</span>
          <h2 className="mt-1 text-title-md font-title-md font-bold text-on-surface">{title}</h2>
        </div>
        <div className="flex items-start gap-2"><button aria-label={`Modifier ${title}`} className="rounded-lg border border-outline-variant px-2 py-1 text-label-sm text-secondary hover:bg-surface-container" onClick={onEdit} type="button"><Icon className="text-base">edit</Icon>Modifier</button><div className={`rounded-lg bg-surface-container-high p-2.5 ${tone}`}><Icon>{icon}</Icon></div></div>
      </div>
      <div className="mt-4 border-t border-outline-variant/50 pt-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className={`text-headline-md font-headline-md font-extrabold ${tone}`}>{value} <span className="text-title-sm font-title-sm font-normal text-on-surface-variant">{unit}</span></span>
          <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2.5 py-1 text-label-sm font-label-sm font-semibold text-on-surface">{badge}</span>
        </div>
        <p className="mt-2 text-label-sm font-label-sm text-outline">{description}</p>
      </div>
    </article>
  );
}

function PricingModal({ setting, onClose, onSaved }) {
  const [form, setForm] = useState(setting);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, saving]);
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const isExchange = setting.settingKey === 'exchange_cny_mga';
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if ((isExchange && (!form.rate || Number(form.rate) <= 0)) || (!isExchange && (!form.amount || Number(form.amount) <= 0 || !form.minimumBillable || Number(form.minimumBillable) <= 0)) || !form.deliveryDays.trim() || (!isExchange && !form.effectiveDate)) {
      setError('Tous les champs numériques doivent être positifs et les champs obligatoires renseignés.');
      return;
    }
    setSaving(true);
    try {
      await onSaved(setting.settingKey, {
        sourceCurrency: form.sourceCurrency || undefined,
        targetCurrency: form.targetCurrency || undefined,
        rate: isExchange ? Number(form.rate) : undefined,
        amount: isExchange ? undefined : Number(form.amount),
        currency: form.currency || undefined,
        minimumBillable: isExchange ? undefined : Number(form.minimumBillable),
        deliveryDays: form.deliveryDays.trim(),
        status: form.status,
        ...(!isExchange ? { effectiveDate: form.effectiveDate } : {}),
      });
    } catch (saveError) {
      setError(saveError.message || 'Modification impossible.');
    } finally {
      setSaving(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}><section aria-modal="true" className="w-full max-w-xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" role="dialog"><div className="mb-5 flex items-center justify-between border-b border-outline-variant pb-3"><h2 className="text-headline-sm font-bold text-on-surface">Modifier la valeur tarifaire</h2><button aria-label="Fermer" disabled={saving} onClick={onClose} type="button"><Icon>close</Icon></button></div>{error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-800" role="alert">{error}</p>}<form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>{isExchange ? <><label>Devise source<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" maxLength="3" onChange={setField('sourceCurrency')} required value={form.sourceCurrency || ''} /></label><label>Devise cible<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" maxLength="3" onChange={setField('targetCurrency')} required value={form.targetCurrency || ''} /></label><label>Taux de change<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" min="0.0001" onChange={setField('rate')} required step="0.0001" type="number" value={form.rate || ''} /></label></> : <><label>Tarif<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" min="0.01" onChange={setField('amount')} required step="0.01" type="number" value={form.amount || ''} /></label><label>Devise<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" maxLength="3" onChange={setField('currency')} required value={form.currency || ''} /></label><label>Minimum facturable<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" min="0.001" onChange={setField('minimumBillable')} required step="0.001" type="number" value={form.minimumBillable || ''} /></label></>}{!isExchange && <label>Date d’application<input className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('effectiveDate')} required type="date" value={form.effectiveDate || ''} /></label>}<label>Statut<select className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2" onChange={setField('status')} value={form.status}><option value="active">Actif</option><option value="inactive">Inactif</option></select></label>{isExchange && <p className="rounded-lg bg-surface-container-low p-3 text-body-sm text-on-surface-variant">La date d’application sera automatiquement définie à la date de modification.</p>}<div className="flex justify-end gap-2 md:col-span-2"><button className="rounded-lg border border-outline-variant px-4 py-2" disabled={saving} onClick={onClose} type="button">Annuler</button><button className="rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary" disabled={saving} type="submit">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div></form></section></div>;
}

export default function AdminPricingPage({ onNotice }) {
  const [freightType, setFreightType] = useState('air');
  const [category, setCategory] = useState('general');
  const [insurance, setInsurance] = useState('included');
  const [weight, setWeight] = useState('18.5');
  const [volume, setVolume] = useState('0.12');
  const [pricing, setPricing] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const loadPricing = async () => {
    setLoadingPricing(true);
    try {
      const result = await listPricingSettings();
      if (!Array.isArray(result?.data)) throw new Error('Réponse tarifaire invalide.');
      setPricing(result.data);
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les tarifs.');
    } finally {
      setLoadingPricing(false);
    }
  };
  useEffect(() => { loadPricing(); }, []);
  const settings = useMemo(() => Object.fromEntries(pricing.map((item) => [item.settingKey, item])), [pricing]);
  const airRate = settings.air_express?.amount || 0;
  const seaRate = settings.sea_lcl?.amount || 0;

  const estimate = useMemo(() => {
    const quantity = freightType === 'air' ? Number(weight) || 0 : Number(volume) || 0;
    const amount = quantity * (freightType === 'air' ? airRate : seaRate);
    const protection = insurance === 'included' ? amount * 0.02 : 0;
    return {
      quantity,
      amount,
      protection,
      total: amount + protection,
    };
  }, [airRate, freightType, insurance, seaRate, volume, weight]);

  const formatAmount = (value) => value.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-body-sm text-red-800" role="alert">{error}</div>}
      {loadingPricing && <div className="text-body-sm text-on-surface-variant">Chargement des tarifs…</div>}
      <header className="flex flex-col justify-between gap-4 border-b border-outline-variant/60 pb-5 md:flex-row md:items-end">
        <div>
          <h1 className="text-headline-lg font-headline-lg font-bold tracking-tight text-on-surface">Tarifs, Devis &amp; Cotations</h1>
          <p className="mt-1 text-body-md font-body-md text-on-surface-variant">Pilotez les grilles tarifaires, les taux de change et les estimations de fret du corridor Chine – Madagascar.</p>
        </div>

      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <PricingCard label="Devises & Monnaie Locale" title="Taux de Change Officiel du Jour" icon="currency_exchange" value={settings.exchange_cny_mga ? `1 ${settings.exchange_cny_mga.sourceCurrency} = ${settings.exchange_cny_mga.rate.toLocaleString('fr-FR')} ${settings.exchange_cny_mga.targetCurrency}` : '—'} unit="" badge={settings.exchange_cny_mga?.status === 'active' ? 'Actif' : 'Inactif'} description={settings.exchange_cny_mga ? `Application : ${settings.exchange_cny_mga.effectiveDate}` : 'Aucune valeur tarifaire disponible'} onEdit={() => setEditing(settings.exchange_cny_mga)} />
        <PricingCard label="Fret Aérien Express" title="Fret Aérien Régulier Moyen" icon="flight_takeoff" value={settings.air_express ? settings.air_express.amount.toLocaleString('fr-FR') : '—'} unit={settings.air_express ? `/ ${settings.air_express.currency} / kg` : ''} badge={settings.air_express?.deliveryDays || '—'} description="Corridor CAN (Guangzhou Baiyun) → TNR (Ivato Antananarivo)" onEdit={() => setEditing(settings.air_express)} />
        <PricingCard label="Fret Maritime Groupage" title="Fret Maritime LCL Groupage" icon="directions_boat" value={settings.sea_lcl ? settings.sea_lcl.amount.toLocaleString('fr-FR') : '—'} unit={settings.sea_lcl ? `/ ${settings.sea_lcl.currency} / m³` : ''} badge={settings.sea_lcl ? `Min ${settings.sea_lcl.minimumBillable} CBM` : '—'} description="Transit Foshan/Huangpu → Toamasina" tone="text-secondary-container" onEdit={() => setEditing(settings.sea_lcl)} />
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm" id="quotation-form">
        <div className="flex flex-col justify-between gap-2 border-b border-outline-variant/60 pb-4 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-headline-sm font-headline-sm font-bold text-on-surface"><Icon>calculate</Icon>Simulateur &amp; Calculateur Rapide de Cotation</h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Estimez en temps réel le coût d’affrètement selon les normes de taxation volumétrique et de change CoreLink</p>
          </div>
          <span className="rounded-lg border border-secondary-fixed bg-surface-container-low px-3 py-1 text-label-md font-label-md text-secondary">Taux actif : {settings.exchange_cny_mga ? `1 ${settings.exchange_cny_mga.sourceCurrency} = ${settings.exchange_cny_mga.rate} ${settings.exchange_cny_mga.targetCurrency}` : 'non disponible'}</span>
        </div>
        <form className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-12" onSubmit={(event) => event.preventDefault()}>
          <label className="md:col-span-4"><span className="mb-1.5 block text-label-md font-label-md text-on-surface-variant">Mode d’Expédition</span><span className="grid grid-cols-2 gap-2">
            {['air', 'sea'].map((type) => <span className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-title-sm font-title-sm ${freightType === type ? 'border-secondary bg-surface-container-low text-secondary' : 'border-outline-variant bg-surface-container-lowest text-on-surface'}`} key={type}><input checked={freightType === type} className="text-secondary focus:ring-secondary" name="freight_type" onChange={() => setFreightType(type)} type="radio" value={type} /><span className="flex items-center gap-1.5"><Icon className="text-base">{type === 'air' ? 'flight_takeoff' : 'directions_boat'}</Icon>{type === 'air' ? 'Aérien' : 'Maritime LCL'}</span></span>)}
          </span></label>
          <label className="md:col-span-4"><span className="mb-1.5 block text-label-md font-label-md text-on-surface-variant">Nature de Marchandise</span><select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface" onChange={(event) => setCategory(event.target.value)} value={category}><option value="general">Marchandises Générales (Textile, Quincaillerie standard)</option><option value="electronics">Électronique sensible &amp; Smartphones</option><option value="battery">Batteries &amp; Matières Spéciales DG</option><option value="cosmetics">Cosmétiques, Liquides &amp; Crèmes</option><option value="automotive">Pièces détachées auto &amp; Métallurgie</option></select></label>
          <label className="md:col-span-4"><span className="mb-1.5 block text-label-md font-label-md text-on-surface-variant">Assurance &amp; Protection (2% ad val.)</span><select className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface" onChange={(event) => setInsurance(event.target.value)} value={insurance}><option value="included">Oui (Inclus — Couverture intégrale 100%)</option><option value="none">Non (Décharge de responsabilité signée)</option></select></label>
          <label className="md:col-span-4"><span className="mb-1.5 block text-label-md font-label-md text-on-surface-variant">Poids Réel (kg)</span><input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-title-sm text-on-surface" min="0" onChange={(event) => setWeight(event.target.value)} step="0.1" type="number" value={weight} /></label>
          <label className="md:col-span-4"><span className="mb-1.5 block text-label-md font-label-md text-on-surface-variant">Volume Réel (CBM / m³)</span><input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-title-sm text-on-surface" min="0" onChange={(event) => setVolume(event.target.value)} step="0.01" type="number" value={volume} /></label>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-low px-3 py-2.5 text-body-sm md:col-span-4"><span className="flex items-center gap-1.5 text-on-surface-variant"><Icon className="text-sm text-secondary">info</Icon>Ratio Aérien : 1 CBM = 167 kg</span><span className="rounded border border-secondary-fixed bg-surface-container px-2 py-0.5 text-label-sm font-label-sm font-semibold text-secondary">Poids réel prépondérant</span></div>
        </form>
        <div className="mt-5 grid gap-4 rounded-xl border border-surface-container-highest bg-surface-container-low p-5 md:grid-cols-4">
          <div><span className="block text-label-sm text-on-surface-variant">Base de calcul</span><strong className="text-title-md text-on-surface">{estimate.quantity} {freightType === 'air' ? 'kg' : 'CBM'}</strong></div>
          <div><span className="block text-label-sm text-on-surface-variant">Fret estimé</span><strong className="text-title-md text-secondary">{formatAmount(estimate.amount)} {freightType === 'air' ? 'Ar' : 'USD'}</strong></div>
          <div><span className="block text-label-sm text-on-surface-variant">Assurance</span><strong className="text-title-md text-on-surface">{formatAmount(estimate.protection)} {freightType === 'air' ? 'Ar' : 'USD'}</strong></div>
          <div><span className="block text-label-sm text-on-surface-variant">Total indicatif</span><strong className="text-headline-sm text-secondary">{formatAmount(estimate.total)} {freightType === 'air' ? 'Ar' : 'USD'}</strong></div>
        </div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-title-sm font-title-sm text-on-secondary" onClick={() => onNotice(`Estimation calculée pour la catégorie ${category}. Aucun devis n’est enregistré par cette page.`)} type="button"><Icon>request_quote</Icon>Générer une estimation</button>
      </section>
      {editing && <PricingModal onClose={() => setEditing(null)} onSaved={async (key, values) => { const result = await updatePricingSetting(key, values); setPricing((current) => current.map((item) => item.settingKey === key ? result.data : item)); setEditing(null); onNotice?.('Tarif enregistré avec succès.'); }} setting={editing} />}

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-outline-variant/60 p-5 md:flex-row md:items-center"><div><h2 className="flex items-center gap-2 text-headline-sm font-headline-sm font-bold text-on-surface"><Icon>table_chart</Icon>Grille Tarifaire Opérationnelle</h2><p className="text-body-sm text-on-surface-variant">Référentiel des coûts de transport, délais et spécifications douanières</p></div><button className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-label-md font-label-md text-on-surface" onClick={() => onNotice('La mise à jour de la grille nécessite un endpoint backend de gestion tarifaire.')} type="button"><Icon className="text-sm">edit</Icon>Mettre à jour Grille</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-left"><thead><tr className="border-b border-outline-variant bg-surface-container-low text-label-md font-label-md uppercase tracking-wider text-on-surface-variant"><th className="px-5 py-3.5">Catégorie de Marchandise</th><th className="px-5 py-3.5">Fret Aérien (CAN → TNR)</th><th className="px-5 py-3.5">Fret Maritime LCL (FOS → TMM)</th><th className="px-5 py-3.5">Délai Indicatif</th><th className="px-5 py-3.5">Spécifications &amp; Traitement Douanier</th><th className="px-4 py-3.5 text-right">Statut</th></tr></thead><tbody className="divide-y divide-outline-variant/60 text-body-sm">{categories.map((item) => <tr className="transition-colors hover:bg-surface-container-low/60" key={item.name}><td className="px-5 py-4"><div className="flex items-center gap-3"><Icon className={`rounded-lg p-2 ${item.tone}`}>{item.icon}</Icon><div><span className="block text-title-sm font-title-sm font-bold text-on-surface">{item.name}</span><span className="text-label-sm text-on-surface-variant">{item.description}</span></div></div></td><td className="px-5 py-4 font-semibold text-on-surface">{item.air}</td><td className="px-5 py-4 font-semibold text-on-surface">{item.sea}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 text-on-surface"><Icon className="text-sm text-outline">schedule</Icon>{item.delay}</span></td><td className="px-5 py-4 text-on-surface-variant">{item.note}</td><td className="px-4 py-4 text-right"><span className={`inline-block rounded-full px-2.5 py-0.5 text-label-sm font-label-sm font-semibold ${item.status === 'Contrôlé' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{item.status}</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="grid grid-cols-1 gap-6 pb-6 xl:grid-cols-3">
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"><div className="flex items-center justify-between border-b border-outline-variant/60 pb-3"><h3 className="flex items-center gap-2 text-title-md font-title-md font-bold text-on-surface"><Icon>receipt_long</Icon>Dernières Demandes de Devis</h3><span className="rounded bg-surface-container px-2 py-0.5 text-label-sm font-label-sm font-semibold text-secondary">4 récents</span></div><div className="divide-y divide-outline-variant/50">{quotations.map(([reference, mode, client, amount, status]) => <div className="flex items-start justify-between gap-3 py-3" key={reference}><div><div className="flex flex-wrap items-center gap-2"><strong className="text-body-sm text-on-surface">{reference}</strong><span className="text-label-sm text-outline">{mode}</span></div><p className="mt-0.5 text-label-sm text-on-surface-variant">{client}</p><strong className="mt-1 block text-title-sm text-secondary">{amount}</strong></div><span className={`rounded-full px-2 py-0.5 text-label-sm font-label-sm font-semibold ${status === 'Accepté' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{status}</span></div>)}</div><button className="mt-3 block w-full rounded-lg bg-surface-container-low px-3 py-2 text-center text-label-md font-label-md font-semibold text-secondary" onClick={() => onNotice('Les demandes de devis ne sont pas encore reliées à une API.')} type="button">Voir tous les 48 devis de la semaine →</button></article>
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"><h3 className="flex items-center gap-2 border-b border-outline-variant/60 pb-3 text-title-md font-title-md font-bold text-on-surface"><Icon>policy</Icon>Conditions Générales &amp; Suppléments</h3><div className="mt-4 space-y-3.5 text-body-sm"><p><strong className="block text-on-surface">Emballage Renforcé Hub Guangzhou :</strong><span className="text-on-surface-variant">Carton triple cannelure : 15 RMB / colis. Caissage bois : 80 à 150 RMB selon cubage.</span></p><p><strong className="block text-on-surface">Assurance Ad Valorem (Recommandée) :</strong><span className="text-on-surface-variant">2% de la valeur déclarée invoice fournisseur. Indemnisation à 100% perte ou avarie.</span></p><p><strong className="block text-on-surface">Dédouanement Ivato &amp; Toamasina :</strong><span className="text-on-surface-variant">Inclus dans le tarif groupage au kilo ou au m³. Aucun frais de débarquement caché.</span></p><p><strong className="block text-on-surface">Franchise de Gardiennage Behintsy :</strong><span className="text-on-surface-variant">5 jours ouvrés gratuits dès notification d’arrivée SMS. Au-delà : 2 500 Ar / jour / colis.</span></p></div><div className="mt-4 rounded-lg border border-surface-container-high bg-surface-container-low p-3 text-label-sm text-on-surface-variant">Document légal contractuel officiel — Révision 2025.02 / CoreLink Logistics Antananarivo.</div></article>
        <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm"><div className="flex items-center justify-between border-b border-outline-variant/60 pb-3"><h3 className="flex items-center gap-2 text-title-md font-title-md font-bold text-on-surface"><Icon>trending_up</Icon>Historique des Fluctuations</h3><span className="text-label-sm text-outline">30 derniers jours</span></div><div className="mt-4 space-y-4">{[['Surcharge Carburant Aérien (FSC/BAF)', '-2.4% (Stable)', '42%', 'bg-emerald-500'], ['Fret Conteneur Asie - Tamatave', '+4.1% (Léger pic)', '68%', 'bg-amber-500'], ['Taux MGA / USD (MID MID)', '4 650 Ar (+0.8%)', '55%', 'bg-secondary']].map(([label, value, width, color]) => <div key={label}><div className="mb-1.5 flex justify-between text-body-sm"><span>{label}</span><strong>{value}</strong></div><div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high"><div className={`h-full rounded-full ${color}`} style={{ width }} /></div></div>)}</div><div className="mt-5 rounded-lg bg-surface-container p-3 text-label-sm text-on-surface"><strong>Recommandation système :</strong> Aucune révision à la hausse requise pour la semaine en cours sur le fret aérien régulier.</div><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-label-md font-label-md" onClick={() => onNotice('Le rapport complet des indices mondiaux n’est pas encore disponible.')} type="button"><Icon className="text-sm">analytics</Icon>Rapport complet des indices mondiaux</button></article>
      </section>
    </div>
  );
}
