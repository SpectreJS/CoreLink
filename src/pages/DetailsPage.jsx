import React, { useEffect, useRef, useState } from 'react';
import { findTrackingRecord, normalizeTrackingCode } from '../services/tracking.js';
import { navigateTo } from '../utils/navigation.js';

const stages = [
  { title: 'Enregistré', detail: 'Réception au centre logistique', icon: 'inventory_2' },
  { title: 'Expédié', detail: 'Départ du hub d’origine', icon: 'flight_takeoff' },
  { title: 'En transit', detail: 'Acheminement international', icon: 'sync' },
  { title: 'Arrivé au pays', detail: 'Dédouanement à destination', icon: 'flight_land' },
  { title: 'Disponible', detail: 'Retrait ou livraison finale', icon: 'home_pin' },
];

function displayValue(value, fallback = 'Non renseigné') {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function eventValue(event, ...keys) {
  for (const key of keys) {
    if (typeof event?.[key] === 'string' || typeof event?.[key] === 'number') {
      return String(event[key]);
    }
  }
  return '';
}

export default function DetailsPage({ trackingNumber }) {
  const [record, setRecord] = useState(null);
  const [state, setState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchValue, setSearchValue] = useState(trackingNumber || '');
  const [toastMessage, setToastMessage] = useState('');
  const requestRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const code = normalizeTrackingCode(trackingNumber || '');
    if (!code) {
      setRecord(null);
      setState('error');
      setErrorMessage('Le numéro de suivi est invalide.');
      return undefined;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setRecord(null);
    setState('loading');
    findTrackingRecord(code, controller.signal)
      .then((result) => {
        if (!result) {
          setState('error');
          setErrorMessage('Aucun colis ne correspond à ce numéro de suivi.');
          return;
        }
        setRecord(result);
        setSearchValue(code);
        setState('found');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState('error');
        setErrorMessage(error.message || 'Impossible de charger les détails du colis.');
      })
      .finally(() => {
        if (requestRef.current === controller) requestRef.current = null;
      });

    return () => {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    };
  }, [trackingNumber]);

  useEffect(() => () => {
    requestRef.current?.abort();
    window.clearTimeout(toastTimeoutRef.current);
  }, []);

  const submitSearch = async (event) => {
    event.preventDefault();
    const code = normalizeTrackingCode(searchValue);
    if (!code) {
      setState('error');
      setErrorMessage(searchValue.trim()
        ? 'Le code de suivi contient des caractères invalides.'
        : 'Veuillez saisir un numéro de suivi.');
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState('loading');
    setErrorMessage('');
    try {
      const result = await findTrackingRecord(code, controller.signal);
      if (!result) {
        setState('error');
        setErrorMessage('Aucun colis ne correspond à ce numéro de suivi.');
        return;
      }
      if (normalizeTrackingCode(trackingNumber || '') === code) {
        setRecord(result);
        setSearchValue(code);
        setState('found');
        return;
      }
      navigateTo(`/tracking/details/${encodeURIComponent(code)}`);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setState('error');
      setErrorMessage(error.message || 'Impossible de charger les détails du colis.');
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  const copyTrackingNumber = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API indisponible');
      await navigator.clipboard.writeText(displayValue(record?.trackingNumber, ''));
      setToastMessage('Numéro de suivi copié !');
    } catch (error) {
      console.error('Impossible de copier le numéro de suivi.', error);
      setToastMessage('Copie indisponible. Sélectionnez le numéro pour le copier.');
    }
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(''), 2500);
  };

  const events = Array.isArray(record?.events) ? [...record.events].reverse() : [];
  const progress = Math.min(100, Math.max(0, Number(record?.progress) || 0));
  const currentStage = Math.min(stages.length - 1, Math.floor((progress / 100) * (stages.length - 1)));
  const shipmentCode = displayValue(record?.trackingNumber, trackingNumber || '—');

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 details-page">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a1526]/70 border border-[#1e3a66]/50 rounded-xl px-4 py-3 text-xs backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-mono uppercase tracking-wider text-[11px] font-semibold">Mode démonstration :</span>
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            Données fictives
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-slate-300">SUIVI STATIQUE DE DÉMONSTRATION</span>
        </div>
      </div>

      <section className="relative rounded-2xl bg-gradient-to-b from-[#0c1c36] to-[#081224] p-6 sm:p-10 border border-[#1e3a66] shadow-2xl overflow-hidden grid-bg" id="search-section">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-3xl space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122749]/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider uppercase font-semibold">
            <span className="material-symbols-outlined text-[15px] text-cyan-400">flight_takeoff</span>
            CORRIDOR CARGO AÉRIEN EXPRESS &amp; MARITIME
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Où en est <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">votre expédition ?</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Consultez les données fictives de démonstration pour un numéro présent dans le jeu d’exemple.
          </p>
        </div>

        <form className="mt-8 relative z-10" id="trackingForm" onSubmit={submitSearch}>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch max-w-4xl">
            <div className="relative flex-1 group">
              <label className="sr-only" htmlFor="trackingInput">Numéro de suivi</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400 group-focus-within:text-white transition-colors">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <input
                autoComplete="off"
                className="w-full pl-12 pr-10 py-3.5 bg-[#050b14]/90 border border-[#1e3a66] rounded-xl text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all tracking-wide"
                id="trackingInput"
                onChange={(event) => {
                  if (state === 'loading') {
                    requestRef.current?.abort();
                    requestRef.current = null;
                    setState('idle');
                  }
                  setSearchValue(event.target.value);
                }}
                placeholder="Ex : CL-2026-00125"
                spellCheck="false"
                type="text"
                value={searchValue}
              />
              <button
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                onClick={() => setSearchValue('')}
                title="Effacer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            </div>
            <button
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] border border-cyan-400/30"
              type="submit"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Suivre le colis
            </button>
          </div>
          <p className="mt-3 text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-cyan-400">receipt_long</span>
            Codes de test : CL-2026-00125 et CL123456789.
          </p>
        </form>
      </section>

      {state === 'loading' && (
        <div aria-live="polite" className="py-20 text-center space-y-4 bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-8 shadow-2xl">
          <div className="inline-block animate-spin text-cyan-400">
            <span className="material-symbols-outlined text-[48px]">sync</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recherche du numéro de suivi…</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">Vérification dans le jeu de données de démonstration.</p>
        </div>
      )}

      {state === 'error' && (
        <div aria-live="assertive" className="bg-[#0a1526] rounded-2xl border border-red-500/40 p-8 sm:p-10 text-center space-y-4 shadow-2xl" role="alert">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">warning</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Numéro de suivi introuvable</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">{errorMessage}</p>
          <p className="text-xs text-slate-400">Essayez CL-2026-00125 ou CL123456789.</p>
        </div>
      )}

      {state === 'found' && record && (
        <div className="space-y-8" id="activeStateWrapper">
          <section className="bg-[#0a1526]/90 rounded-2xl border border-[#1e3a66] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
              <div className="border-b sm:border-b-0 sm:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Numéro de suivi</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white tracking-wider break-all">{shipmentCode}</span>
                  <button className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#122442] transition-colors" onClick={copyTrackingNumber} title="Copier le numéro" type="button">
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>
                </div>
                <span className="text-xs font-mono text-cyan-400/80 mt-1 block">RÉF : {displayValue(record.reference, '—')}</span>
              </div>
              <div className="border-b sm:border-b-0 lg:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 lg:pr-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Statut actuel</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  {displayValue(record.status)}
                </div>
              </div>
              <div className="border-b sm:border-b-0 sm:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Route fret</span>
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <span className="text-slate-200">{displayValue(record.origin)}</span>
                  <span className="material-symbols-outlined text-[16px] text-cyan-400">arrow_forward</span>
                  <span className="text-slate-200">{displayValue(record.destination)}</span>
                </div>
              </div>
              <div className="border-b sm:border-b-0 lg:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 lg:pr-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Mode d’acheminement</span>
                <div className="flex items-center gap-2 text-white font-medium text-sm">
                  <span className="material-symbols-outlined text-[20px] text-cyan-400">airplanemode_active</span>
                  {displayValue(record.freightType)}
                </div>
                <span className="text-xs text-slate-400 mt-1 block font-mono">Estimation : {displayValue(record.estimatedDelivery)}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Dernière mise à jour</span>
                <p className="text-xs font-mono text-white leading-snug">{displayValue(record.updatedAt)}</p>
                <span className="text-xs font-mono text-amber-300 flex items-center gap-1.5 mt-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                  Donnée de démonstration
                </span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-[#091322] rounded-2xl overflow-hidden border border-[#1e3a66] shadow-xl flex flex-col relative">
              <div className="bg-[#0c1a2e] px-4 sm:px-6 py-3.5 border-b border-[#1e3a66]/60 flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]"></span>
                  <span className="font-mono text-xs font-semibold text-white tracking-wider">SUIVI DU CORRIDOR : CAN ➔ TNR</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">MODE DÉMONSTRATION</span>
              </div>
              <div className="relative w-full overflow-hidden bg-[#060c18] border-b border-[#1e3a66]/60">
                <div className="relative w-full min-h-72 sm:min-h-80 overflow-hidden grid-bg">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091322] via-[#091322]/40 to-[#060c18]/70"></div>
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050b14]/90 border border-cyan-400/40 backdrop-blur-md shadow-lg">
                      <span className="material-symbols-outlined text-cyan-400 text-[18px]">package_2</span>
                      <span className="font-mono text-xs font-bold text-white tracking-wide">COLIS #{shipmentCode}</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-[#050b14]/90 border border-amber-500/40 text-[11px] font-mono font-semibold text-amber-200">DONNÉES FICTIVES</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-[#0a1526]/95 border border-[#1e3a66] backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
                          <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-white">Corridor {displayValue(record.origin)} ➔ {displayValue(record.destination)}</h2>
                          <p className="text-xs text-slate-300 font-mono mt-0.5">{displayValue(record.currentHub)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-cyan-300">{progress}% du parcours estimé</span>
                    </div>
                    <div className="w-full bg-[#050b14] h-2 rounded-full overflow-hidden border border-[#1e3a66]/50 mb-2">
                      <div className="bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 h-full rounded-full shadow-[0_0_8px_#38bdf8] transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 gap-2">
                      <span>{displayValue(record.origin)}</span>
                      <span className="text-cyan-400 font-bold">{events.length} étape{events.length > 1 ? 's' : ''} enregistrée{events.length > 1 ? 's' : ''}</span>
                      <span>{displayValue(record.destination)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5 bg-[#081224] border-t border-[#1e3a66]/50">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {stages.map((stage, index) => {
                      const completed = index < currentStage;
                      const current = index === currentStage;
                      return (
                        <div
                          className={`p-3 rounded-xl relative flex flex-col justify-between ${
                            current
                              ? 'bg-gradient-to-b from-[#0d2242] to-[#0a1b35] border-2 border-cyan-400/90 shadow-lg shadow-cyan-500/10'
                              : completed
                                ? 'bg-[#0c1a2e]/80 border border-emerald-500/40'
                                : 'bg-[#0a1526]/50 border border-[#1e3a66]/50 opacity-75'
                          }`}
                          key={stage.title}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${completed ? 'bg-emerald-500/20 text-emerald-400' : current ? 'bg-cyan-400 text-slate-950' : 'bg-[#0c1a30] text-slate-400'}`}>
                              <span className="material-symbols-outlined text-[14px]">{completed ? 'check' : stage.icon}</span>
                            </span>
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${completed ? 'text-emerald-400' : current ? 'text-cyan-300' : 'text-slate-400'}`}>
                              {completed ? 'Terminé' : current ? 'En cours' : 'À venir'}
                            </span>
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${current ? 'text-cyan-300' : 'text-white'}`}>{stage.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{stage.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-[#091526] px-4 sm:px-6 py-3 border-t border-[#1e3a66]/60 flex flex-wrap justify-between items-center text-xs font-mono text-slate-400 gap-3">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-cyan-400 text-[16px]">info</span>Étapes indicatives issues du jeu de données de démonstration.</span>
                <span className="text-cyan-400/90 font-semibold">UTC+3 | UTC+8</span>
              </div>
            </div>

            <aside className="lg:col-span-4 bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1e3a66]/70 pb-4 gap-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-[20px]">assignment</span>
                  Fiche technique
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-semibold">DÉMO</span>
              </div>
              <dl className="space-y-3.5 font-mono text-xs">
                {[
                  ['Numéro de suivi', shipmentCode],
                  ['Référence interne', displayValue(record.reference)],
                  ['Poids & volume', displayValue(record.weight)],
                  ['Événements enregistrés', `${events.length} événement${events.length === 1 ? '' : 's'}`],
                  ['Hub actuel', displayValue(record.currentHub)],
                  ['Dernière mise à jour', displayValue(record.updatedAt)],
                ].map(([label, value]) => (
                  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#1e3a66]/40" key={label}>
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="text-slate-200 font-semibold text-right break-words">{value}</dd>
                  </div>
                ))}
              </dl>
              <button className="w-full py-2.5 px-4 rounded-xl border border-[#1e3a66] hover:border-cyan-400/60 bg-[#0e1e36] hover:bg-[#132847] text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]" onClick={copyTrackingNumber} type="button">
                <span className="material-symbols-outlined text-[18px] text-cyan-400">content_copy</span>
                Copier le numéro de suivi
              </button>
              <div className="bg-gradient-to-br from-[#0c1e38] to-[#081528] rounded-xl p-4 sm:p-5 border border-cyan-500/30 space-y-3.5 shadow-md" id="support">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/30">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">Assistance Madagascar</p>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">Contactez l’équipe locale pour toute question sur votre expédition.</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#1e3a66]/60 flex flex-col gap-2.5 text-xs font-medium">
                  <a className="flex items-center gap-2 text-cyan-300 hover:text-white transition-colors" href="tel:+261386843085">
                    <span className="material-symbols-outlined text-[18px] text-cyan-400">phone</span>
                    +261 38 68 430 85
                  </a>
                  <a className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors" href="https://wa.me/261386843085" rel="noopener noreferrer" target="_blank">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Échanger sur WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </section>

          <section className="bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-6 sm:p-8 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e3a66]/70 pb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Historique du colis</h2>
                <p className="text-sm text-slate-400 mt-1">Événements présents dans les données de démonstration.</p>
              </div>
              <div className="text-xs font-mono text-cyan-400/80 bg-[#0c1a2e] px-3 py-1.5 rounded-lg border border-[#1e3a66]">
                FUSEAUX : UTC+8 / UTC+3
              </div>
            </div>
            {events.length > 0 ? (
              <ol className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:via-cyan-400 before:to-[#1e3a66] before:content-['']">
                {events.map((item, index) => {
                  if (!item || typeof item !== 'object') return null;
                  const title = eventValue(item, 'status', 'title', 'description');
                  if (!title) return null;
                  const location = eventValue(item, 'location');
                  const date = eventValue(item, 'date', 'timestamp');
                  const current = index === events.length - 1;
                  return (
                    <li className="relative group" key={`${title}-${index}`}>
                      <div className={`absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full flex items-center justify-center font-bold ring-4 ring-[#0a1526] ${current ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50' : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'}`}>
                        <span className="material-symbols-outlined text-[18px]">{current ? 'sync' : 'check'}</span>
                      </div>
                      <div className={`rounded-xl p-5 transition-all ${current ? 'bg-gradient-to-r from-[#0d2242] to-[#0a1b35] border-2 border-cyan-400/80 shadow-2xl' : 'bg-[#0d1c33] border border-[#1e3a66] hover:border-slate-400'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h3 className={`text-base font-bold tracking-tight ${current ? 'text-cyan-300' : 'text-white'}`}>{title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider ${current ? 'bg-blue-950 border border-cyan-400/60 text-cyan-300' : 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'}`}>
                            {current ? 'Étape actuelle' : 'Confirmé'}
                          </span>
                        </div>
                        {(location || date) && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300 mb-3">
                            {location && <span className="flex items-center gap-1 text-cyan-300"><span className="material-symbols-outlined text-[16px]">location_on</span>{location}</span>}
                            {location && date && <span className="text-slate-500 hidden sm:inline">•</span>}
                            {date && <span className="flex items-center gap-1 text-slate-300"><span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>{date}</span>}
                          </div>
                        )}
                        {typeof item.description === 'string' && item.description !== title && (
                          <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-slate-300">Aucun événement n’est enregistré pour ce colis de démonstration.</p>
            )}
          </section>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[
          ['verified_user', 'Assurance Cargo', 'Les données affichées sur cette page sont des données de démonstration et ne représentent pas un suivi réel.'],
          ['gavel', 'Conformité douanière', 'Les étapes de transport sont présentées à titre illustratif pour montrer le parcours de suivi.'],
          ['notifications_active', 'Alertes de suivi', 'Les événements affichés proviennent du jeu de données statique fourni avec l’application.'],
        ].map(([icon, title, description]) => (
          <div className="bg-[#0a1526] rounded-2xl p-6 border border-[#1e3a66] hover:border-cyan-400/50 transition-all space-y-3.5 shadow-lg group" key={title}>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px]">{icon}</span>
            </div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
          </div>
        ))}
      </section>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0c1a2e] border border-cyan-400/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50" id="copyToast" role="status">
          <span className="material-symbols-outlined text-[20px] text-cyan-400">{toastMessage.startsWith('Numéro') ? 'check_circle' : 'info'}</span>
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
