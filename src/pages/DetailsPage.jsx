import React, { useEffect, useRef, useState } from 'react';

export default function DetailsPage() {
  const [trackingNumber, setTrackingNumber] = useState(
    () => new URLSearchParams(window.location.search).get('tracking') || 'CL123456789',
  );
  const [trackingState, setTrackingState] = useState('active');
  const [toastMessage, setToastMessage] = useState('');
  const searchTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(searchTimeoutRef.current);
    window.clearTimeout(toastTimeoutRef.current);
  }, []);

  const triggerSearch = (event) => {
    event.preventDefault();
    const normalized = trackingNumber.trim().toUpperCase();
    if (!normalized) {
      setTrackingState('error');
      return;
    }

    setTrackingNumber(normalized);
    setTrackingState('loading');
    window.clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = window.setTimeout(() => {
      setTrackingState(
        normalized.toLowerCase().includes('error') || normalized === '000000' ? 'error' : 'active',
      );
    }, 700);
  };

  const setDemoTrackingState = (state) => {
    window.clearTimeout(searchTimeoutRef.current);
    setTrackingState(state);
  };

  const copyTrackingNumber = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API indisponible');
      }
      await navigator.clipboard.writeText(trackingNumber);
      setToastMessage('Numéro de suivi copié dans le presse-papiers !');
    } catch (error) {
      console.error('Impossible de copier le numéro de suivi.', error);
      setToastMessage('Copie indisponible. Sélectionnez le numéro pour le copier.');
    }

    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(''), 2500);
  };

  return (
<main className="details-page w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

<div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a1526]/70 border border-[#1e3a66]/50 rounded-xl px-4 py-3 text-xs backdrop-blur-sm">
<div className="flex flex-wrap items-center gap-2">
<span className="text-slate-400 font-mono uppercase tracking-wider text-[11px] font-semibold">Mode Démo :</span>
<button aria-pressed={trackingState === 'active'} className={`px-3 py-1 rounded-md text-xs ${trackingState === 'active' ? 'font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'font-medium text-slate-400 hover:text-slate-200 bg-[#0c1a30] border border-[#1b3154] hover:border-slate-500'} transition-all`} id="btn-state-active" onClick={() => setDemoTrackingState('active')} type="button">
        Envoi Actif ({trackingNumber})
      </button>
<button aria-pressed={trackingState === 'loading'} className={`px-3 py-1 rounded-md text-xs ${trackingState === 'loading' ? 'font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'font-medium text-slate-400 hover:text-slate-200 bg-[#0c1a30] border border-[#1b3154] hover:border-slate-500'} transition-all`} id="btn-state-loading" onClick={() => setDemoTrackingState('loading')} type="button">
        Recherche en cours
      </button>
<button aria-pressed={trackingState === 'error'} className={`px-3 py-1 rounded-md text-xs ${trackingState === 'error' ? 'font-semibold bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm' : 'font-medium text-slate-400 hover:text-slate-200 bg-[#0c1a30] border border-[#1b3154] hover:border-slate-500'} transition-all`} id="btn-state-error" onClick={() => setDemoTrackingState('error')} type="button">
        Numéro Inconnu (Erreur)
      </button>
</div>
<div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
<span className="text-slate-300">API CAN-TNR TELEMETRY ONLINE</span>
<span className="text-[#1e3a66] hidden sm:inline">•</span>
<span className="text-cyan-400 hidden sm:inline">PINGS SYNC 100%</span>
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
        Suivi en temps réel de votre marchandise depuis le hub de consolidation à Guangzhou jusqu'au dédouanement et retrait au dépôt d'Antananarivo.
      </p>
</div>

<form className="mt-8 relative z-10" id="trackingForm" onSubmit={triggerSearch}>
<div className="flex flex-col sm:flex-row gap-3 items-stretch max-w-4xl">
<div className="relative flex-1 group">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400 group-focus-within:text-white transition-colors">
<span className="material-symbols-outlined text-[22px]">inventory_2</span>
</div>
<input autoComplete="off" className="w-full pl-12 pr-10 py-3.5 bg-[#050b14]/90 border border-[#1e3a66] rounded-xl text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-inner transition-all tracking-wide" id="trackingInput" onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Ex : CL123456789" spellCheck="false" type="text" value={trackingNumber} />
<button className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors" onClick={() => setTrackingNumber('')} title="Effacer" type="button">
<span className="material-symbols-outlined text-[18px]">cancel</span>
</button>
</div>
<button className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] border border-cyan-400/30" type="submit">
<span className="material-symbols-outlined text-[20px]">search</span>
          Suivre le colis
        </button>
</div>
<p className="mt-3 text-xs font-mono text-slate-400 flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-cyan-400">receipt_long</span>
        Numéro figurant sur votre bordereau d'expédition CoreLink ou votre reçu de pesée.
      </p>
</form>
</section>

<div id="trackingViewContainer" aria-live="polite">

{trackingState === 'active' && <div className="space-y-8" id="activeStateWrapper">

<section className="bg-[#0a1526]/90 rounded-2xl border border-[#1e3a66] p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">

<div className="border-b sm:border-b-0 sm:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 sm:pr-4">
<span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Numéro de suivi</span>
<div className="flex items-center gap-2">
<span className="font-mono text-lg font-bold text-white tracking-wider">{trackingNumber}</span>
<button className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#122442] transition-colors" onClick={copyTrackingNumber} title="Copier le numéro" type="button">
<span className="material-symbols-outlined text-[18px]">content_copy</span>
</button>
</div>
<span className="text-xs font-mono text-cyan-400/80 mt-1 block">RÉF : CR-2025-8842</span>
</div>

<div className="border-b sm:border-b-0 lg:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 lg:pr-4">
<span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Statut actuel</span>
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono uppercase tracking-wider">
<span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
<span>En transit international</span>
</div>
</div>

<div className="border-b sm:border-b-0 sm:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 sm:pr-4">
<span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Route Fret</span>
<div className="flex items-center gap-2 text-white font-semibold text-sm">
<span className="text-slate-200">Chine (CAN)</span>
<span className="material-symbols-outlined text-[16px] text-cyan-400">arrow_forward</span>
<span className="text-slate-200">Madagascar (TNR)</span>
</div>
<span className="text-xs text-slate-400 mt-1 block font-mono">Guangzhou ➔ Antananarivo</span>
</div>

<div className="border-b sm:border-b-0 lg:border-r border-[#1e3a66]/70 pb-4 sm:pb-0 lg:pr-4">
<span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Mode d'acheminement</span>
<div className="flex items-center gap-2 text-white font-medium text-sm">
<span className="material-symbols-outlined text-[20px] text-cyan-400">airplanemode_active</span>
<span>Transport aérien express</span>
</div>
<span className="text-xs text-slate-400 mt-1 block font-mono">Délai estimé : 7 à 10 jours ouvrés</span>
</div>

<div>
<span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-semibold">Dernière synchro</span>
<p className="text-xs font-mono text-white leading-snug">
              24 Mai 2025 • 09:15 UTC+8
            </p>
<span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 mt-1 font-medium">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Synchronisé en direct
            </span>
</div>
</div>
</section>

<section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-8 bg-[#091322] rounded-2xl overflow-hidden border border-[#1e3a66] shadow-xl flex flex-col relative">

<div className="bg-[#0c1a2e] px-4 sm:px-6 py-3.5 border-b border-[#1e3a66]/60 flex flex-wrap justify-between items-center gap-3">
<div className="flex items-center gap-2.5">
<span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#38bdf8]"></span>
<span className="font-mono text-xs font-semibold text-white tracking-wider">RADAR COULOIR AÉRIEN : CAN ➔ TNR</span>
</div>
<div className="flex items-center gap-4 text-xs font-mono text-slate-400">
<span className="hidden sm:inline">ALT : 33,000 FT</span>
<span className="text-cyan-400 font-semibold">SEGMENT ACTIF : HUB GUANGZHOU</span>
</div>
</div>

<div className="relative w-full h-80 sm:h-96 bg-[#060c18] overflow-hidden flex items-center justify-center">

<div className="absolute inset-0 grid-bg opacity-30"></div>

<svg className="w-full h-full" fill="none" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">

<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="50" x2="750" y1="50" y2="50"></line>
<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="50" x2="750" y1="200" y2="200"></line>
<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="50" x2="750" y1="350" y2="350"></line>
<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="200" x2="200" y1="20" y2="380"></line>
<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="450" x2="450" y1="20" y2="380"></line>
<line opacity="0.4" stroke="#1e3a66" strokeDasharray="4 4" strokeWidth="0.5" x1="650" x2="650" y1="20" y2="380"></line>


<path d="M560 90 Q620 70 690 90 T720 160 Q650 180 580 140 Z" fill="#0d213f" opacity="0.6" stroke="#1e3a66" strokeWidth="1"></path>


<path d="M220 180 Q260 210 240 290 Q200 320 180 250 Z" fill="#0d213f" opacity="0.6" stroke="#1e3a66" strokeWidth="1"></path>

<path d="M285 240 Q305 260 295 310 Q280 320 275 280 Z" fill="#0e284f" opacity="0.8" stroke="#38bdf8" strokeWidth="1.2"></path>

<path d="M640 110 Q450 130 290 285" fill="none" stroke="#1e3a66" strokeDasharray="6 6" strokeWidth="3"></path>

<path d="M640 110 Q580 116 540 130" fill="none" stroke="url(#cyanGlowGrad)" strokeLinecap="round" strokeWidth="4"></path>
<defs>
<linearGradient id="cyanGlowGrad" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" stopColor="#38bdf8"></stop>
<stop offset="100%" stopColor="#00d2ff"></stop>
</linearGradient>
</defs>

<circle cx="640" cy="110" fill="#0369a1" fillOpacity="0.3" r="14" stroke="#38bdf8" strokeWidth="1.5"></circle>
<circle cx="640" cy="110" fill="#38bdf8" r="6"></circle>

<circle cx="540" cy="130" fill="#2563eb" fillOpacity="0.4" r="10" stroke="#60a5fa" strokeWidth="1.5">
<animate attributeName="r" dur="2s" repeatCount="indefinite" values="8;14;8"></animate>
</circle>
<circle cx="540" cy="130" fill="#ffffff" r="4"></circle>

<circle cx="290" cy="285" fill="#064e3b" fillOpacity="0.3" r="12" stroke="#34d399" strokeWidth="1.5"></circle>
<circle cx="290" cy="285" fill="#34d399" r="5"></circle>
</svg>

<div className="absolute top-10 right-10 sm:right-16 bg-[#0c1a2e]/90 border border-cyan-500/50 backdrop-blur-md rounded-lg p-2.5 text-left shadow-lg pointer-events-none">
<div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 font-bold uppercase">
<span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                ORIGINE : GUANGZHOU (CAN)
              </div>
<p className="text-xs text-white font-medium mt-0.5">Entrepôt Baiyun Export</p>
<p className="text-[10px] font-mono text-slate-400">23.1291° N, 113.2644° E</p>
</div>

<div className="absolute bottom-10 left-8 sm:left-14 bg-[#0c1a2e]/90 border border-emerald-500/50 backdrop-blur-md rounded-lg p-2.5 text-left shadow-lg pointer-events-none">
<div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 font-bold uppercase">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                DESTINATION : MADAGASCAR (TNR)
              </div>
<p className="text-xs text-white font-medium mt-0.5">Aéroport Ivato / Hub Behintsy</p>
<p className="text-[10px] font-mono text-slate-400">-18.8792° S, 47.5079° E</p>
</div>

<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050b14]/85 border border-[#1e3a66] backdrop-blur-md px-4 py-2 rounded-xl text-center shadow-2xl">
<div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 font-bold">
<span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                TRAITEMENT EXPORT &amp; PALETTISATION
              </div>
<p className="text-[11px] text-slate-300 mt-0.5">Colis scellé pour le prochain vol cargo</p>
</div>
</div>

<div className="bg-[#091526] px-4 sm:px-6 py-3 border-t border-[#1e3a66]/60 flex flex-wrap justify-between items-center text-xs font-mono text-slate-400 gap-3">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-cyan-400 text-[16px]">info</span>
<span>Ligne de fret aérien directe : Transit 7 à 10 jours ouvrés sans rupture de charge.</span>
</div>
<span className="text-cyan-400/90 font-semibold">TNR TIME : UTC+3 | BJS TIME : UTC+8</span>
</div>
</div>

<div className="lg:col-span-4 bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-6 shadow-xl space-y-6">
<div className="flex items-center justify-between border-b border-[#1e3a66]/70 pb-4">
<h2 className="text-base font-bold text-white flex items-center gap-2">
<span className="material-symbols-outlined text-cyan-400 text-[20px]">assignment</span>
              Fiche Technique de l'Envoi
            </h2>
<span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-semibold">
              Fret Aérien
            </span>
</div>

<div className="space-y-3.5 font-mono text-xs">
<div className="flex items-center justify-between py-1.5 border-b border-[#1e3a66]/40">
<span className="text-slate-400">Numéro de suivi</span>
<span className="font-bold text-white">{trackingNumber}</span>
</div>
<div className="flex items-center justify-between py-1.5 border-b border-[#1e3a66]/40">
<span className="text-slate-400">Référence interne</span>
<span className="text-slate-200 font-semibold">CR-2025-8842</span>
</div>
<div className="flex items-center justify-between py-1.5 border-b border-[#1e3a66]/40">
<span className="text-slate-400">Poids &amp; Volume</span>
<span className="text-slate-400 italic">En cours de pesée officielle</span>
</div>
<div className="flex items-center justify-between py-1.5 border-b border-[#1e3a66]/40">
<span className="text-slate-400">Événements enregistrés</span>
<span className="font-bold text-cyan-300">2 complétés / 5 jalons</span>
</div>
<div className="flex items-center justify-between py-1.5 border-b border-[#1e3a66]/40">
<span className="text-slate-400">Hub actuel</span>
<span className="text-slate-200 font-semibold text-right">Guangzhou Export Hub</span>
</div>
<div className="flex items-center justify-between py-1.5">
<span className="text-slate-400">Synchronisation</span>
<span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                En direct (temps réel)
              </span>
</div>
</div>

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
<p className="font-semibold text-sm text-white">Assistance Directe Madagascar</p>
<p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Équipe locale dédiée à Antananarivo pour le dédouanement et le retrait de votre fret.
                </p>
</div>
</div>
<div className="pt-3 border-t border-[#1e3a66]/60 flex flex-col gap-2.5 text-xs font-medium">
<a className="flex items-center gap-2 text-cyan-300 hover:text-white transition-colors" href="tel:+261386843085">
<span className="material-symbols-outlined text-[18px] text-cyan-400">phone</span>
<span>+261 38 68 430 85</span>
</a>
<a className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors" href="https://wa.me/261386843085" rel="noopener noreferrer" target="_blank">
<span className="material-symbols-outlined text-[18px]">chat</span>
<span>Échanger sur WhatsApp avec un agent</span>
</a>
</div>
</div>
</div>
</section>

<section className="bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-6 sm:p-8 shadow-xl space-y-8">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e3a66]/70 pb-5">
<div>
<h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Historique de votre colis</h2>
<p className="text-sm text-slate-400 mt-1">Consultez les différentes étapes enregistrées pendant le transport international.</p>
</div>
<div className="text-xs font-mono text-cyan-400/80 bg-[#0c1a2e] px-3 py-1.5 rounded-lg border border-[#1e3a66]">
            FUSEAUX : UTC+8 (Chine) / UTC+3 (Madagascar)
          </div>
</div>

<div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:inset-0 before:left-3.5 sm:before:left-4 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:via-cyan-400 before:to-[#1e3a66] before:content-['']">

<div className="relative group">

<div className="absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 ring-4 ring-[#0a1526]">
<span className="material-symbols-outlined text-[18px] font-bold">check</span>
</div>
<div className="bg-[#0d1c33] rounded-xl border border-[#1e3a66] p-5 transition-all hover:border-slate-400">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<h3 className="text-base font-bold text-white tracking-tight">Colis enregistré &amp; Reçu au dépôt</h3>
<span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
                  Confirmé
                </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300 mb-3">
<span className="flex items-center gap-1 text-cyan-300">
<span className="material-symbols-outlined text-[16px]">location_on</span>
                  Centre logistique en Chine (Guangzhou)
                </span>
<span className="text-slate-500 hidden sm:inline">•</span>
<span className="flex items-center gap-1 text-slate-300">
<span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                  22 Mai 2025 • 14:30
                </span>
</div>
<p className="text-sm text-slate-300 leading-relaxed font-body">
                Création du dossier d'expédition et étiquetage standardisé CoreLink avec génération du code-barres de conformité export.
              </p>
</div>
</div>

<div className="relative group">

<div className="absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-400/50 ring-4 ring-[#0a1526]">
<span className="w-3 h-3 rounded-full bg-slate-950 animate-ping"></span>
</div>
<div className="bg-gradient-to-r from-[#0d2242] to-[#0a1b35] rounded-xl border-2 border-cyan-400/80 p-5 shadow-2xl relative overflow-hidden">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<h3 className="text-base font-bold text-cyan-300 flex items-center gap-2 tracking-tight">
<span>Réception au centre logistique</span>
<span className="text-[11px] font-mono bg-cyan-400 text-slate-950 px-2.5 py-0.5 rounded-full font-bold uppercase">Étape actuelle</span>
</h3>
<span className="px-2.5 py-0.5 rounded-full bg-blue-950 border border-cyan-400/60 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                  En cours de traitement
                </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-200 mb-3">
<span className="flex items-center gap-1 text-white font-semibold">
<span className="material-symbols-outlined text-[16px] text-cyan-400">warehouse</span>
                  Hub Logistique Baiyun, Guangzhou, Chine
                </span>
<span className="text-slate-500 hidden sm:inline">•</span>
<span className="flex items-center gap-1 text-cyan-300 font-semibold">
<span className="material-symbols-outlined text-[16px]">schedule</span>
                  24 Mai 2025 • 09:15
                </span>
</div>
<p className="text-sm text-slate-200 leading-relaxed font-body">
                Prise en charge du colis, palettisation aérienne sécurisée, vérification du poids volumétrique et contrôle de conformité douanière export. Préparation du manifeste de vol cargo.
              </p>
</div>
</div>

<div className="relative group opacity-80 hover:opacity-100 transition-opacity">
<div className="absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full bg-[#0d1c33] border-2 border-[#1e3a66] text-slate-400 flex items-center justify-center ring-4 ring-[#0a1526]">
<span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
</div>
<div className="bg-[#0c182c]/80 rounded-xl border border-[#1e3a66]/70 p-5">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<h3 className="text-base font-semibold text-slate-200">Départ international</h3>
<span className="px-2.5 py-0.5 rounded-full bg-[#081224] text-slate-400 border border-[#1e3a66] font-mono text-xs font-medium uppercase">
                  En attente
                </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mb-2">
<span className="flex items-center gap-1">Liaison aérienne Guangzhou CAN ➔ Antananarivo TNR</span>
<span className="text-slate-600 hidden sm:inline">•</span>
<span className="italic text-slate-400">À confirmer selon plan de vol</span>
</div>
<p className="text-sm text-slate-400 leading-relaxed font-body">
                Départ du vol cargo international vers sa destination finale. Transit douanier international sans intermédiaire tiers.
              </p>
</div>
</div>

<div className="relative group opacity-80 hover:opacity-100 transition-opacity">
<div className="absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full bg-[#0d1c33] border-2 border-[#1e3a66] text-slate-400 flex items-center justify-center ring-4 ring-[#0a1526]">
<span className="material-symbols-outlined text-[16px]">flight_land</span>
</div>
<div className="bg-[#0c182c]/80 rounded-xl border border-[#1e3a66]/70 p-5">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<h3 className="text-base font-semibold text-slate-200">Arrivée à Madagascar &amp; Dédouanement</h3>
<span className="px-2.5 py-0.5 rounded-full bg-[#081224] text-slate-400 border border-[#1e3a66] font-mono text-xs font-medium uppercase">
                  En attente
                </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mb-2">
<span className="flex items-center gap-1">Aéroport International Ivato (TNR) / Douane Malagasy</span>
<span className="text-slate-600 hidden sm:inline">•</span>
<span className="italic text-slate-400">En attente d'atterrissage</span>
</div>
<p className="text-sm text-slate-400 leading-relaxed font-body">
                Arrivée au centre logistique de destination, déchargement des conteneurs sécurisés et formalités de dédouanement par nos agents.
              </p>
</div>
</div>

<div className="relative group opacity-80 hover:opacity-100 transition-opacity">
<div className="absolute -left-8 sm:-left-10 top-1 w-7 h-7 rounded-full bg-[#0d1c33] border-2 border-[#1e3a66] text-slate-400 flex items-center justify-center ring-4 ring-[#0a1526]">
<span className="material-symbols-outlined text-[16px]">home_pin</span>
</div>
<div className="bg-[#0c182c]/80 rounded-xl border border-[#1e3a66]/70 p-5">
<div className="flex flex-wrap items-center justify-between gap-2 mb-2">
<h3 className="text-base font-semibold text-slate-200">Livraison finale / Mise à disposition au dépôt</h3>
<span className="px-2.5 py-0.5 rounded-full bg-[#081224] text-slate-400 border border-[#1e3a66] font-mono text-xs font-medium uppercase">
                  Étape finale
                </span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400 mb-2">
<span className="flex items-center gap-1">Dépôt Behintsy, Ambohimangakely ou livraison directe Antananarivo</span>
<span className="text-slate-600 hidden sm:inline">•</span>
<span className="italic text-slate-400">Notification par SMS / WhatsApp</span>
</div>
<p className="text-sm text-slate-400 leading-relaxed font-body">
                Mise à disposition pour retrait client ou déclenchement de la livraison au dernier kilomètre sur présentation de la pièce d'identité et du bordereau.
              </p>
</div>
</div>
</div>
</section>
</div>}

{trackingState === 'loading' && <div className="py-20 text-center space-y-4 bg-[#0a1526] rounded-2xl border border-[#1e3a66] p-8 shadow-2xl" id="loadingStateWrapper" role="status">
<div className="inline-block animate-spin text-cyan-400">
<span className="material-symbols-outlined text-[48px]">sync</span>
</div>
<h3 className="text-xl font-bold text-white tracking-tight">Interrogation des hubs logistiques Chine-Madagascar...</h3>
<p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
        Synchronisation sécurisée avec le manifeste cargo et les systèmes informatiques des terminaux d'Ivato. Veuillez patienter.
      </p>
</div>}

{trackingState === 'error' && <div className="bg-[#0a1526] rounded-2xl border border-red-500/40 p-8 sm:p-10 text-center space-y-4 shadow-2xl" id="errorStateWrapper" role="alert">
<div className="w-16 h-16 mx-auto rounded-full bg-red-950/70 border border-red-500/40 text-red-400 flex items-center justify-center">
<span className="material-symbols-outlined text-[36px]">warning</span>
</div>
<h3 className="text-xl font-bold text-white tracking-tight">Numéro de suivi introuvable</h3>
<p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-body">
        Le colis recherché n'a pas encore été indexé dans notre système ou le bordereau date de moins de 2 heures. Vérifiez le format sur votre reçu.
      </p>
<div className="flex flex-wrap items-center justify-center gap-3 pt-3">
<button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs font-mono tracking-wider shadow-md transition-all" onClick={() => { setTrackingNumber('CL123456789'); setTrackingState('active'); }} type="button">
          RÉESSAYER AVEC CL123456789
        </button>
<a className="px-5 py-2.5 rounded-xl border border-[#1e3a66] hover:border-slate-400 font-mono text-xs font-medium text-slate-200 hover:bg-[#0f213d] transition-all" href="tel:+261386843085">
          Contacter le support à Madagascar
        </a>
</div>
        </div>}
</div>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

<div className="bg-[#0a1526] rounded-2xl p-6 border border-[#1e3a66] hover:border-cyan-400/50 transition-all space-y-3.5 shadow-lg group">
<div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[28px]">verified_user</span>
</div>
<h4 className="text-base font-bold text-white">Assurance Cargo Tous Risques</h4>
<p className="text-xs text-slate-300 leading-relaxed font-body">
        Toutes les marchandises transitant par notre corridor Guangzhou - Ivato bénéficient d'une couverture cargo intégrale jusqu'à la remise en mains propres.
      </p>
</div>

<div className="bg-[#0a1526] rounded-2xl p-6 border border-[#1e3a66] hover:border-cyan-400/50 transition-all space-y-3.5 shadow-lg group">
<div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[28px]">gavel</span>
</div>
<h4 className="text-base font-bold text-white">Conformité Douanière Garantie</h4>
<p className="text-xs text-slate-300 leading-relaxed font-body">
        Gestion intégrée des déclarations et du dédouanement à Madagascar. Aucune surprise fiscale à la réception de votre marchandise au dépôt.
      </p>
</div>

<div className="bg-[#0a1526] rounded-2xl p-6 border border-[#1e3a66] hover:border-cyan-400/50 transition-all space-y-3.5 shadow-lg group">
<div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[28px]">notifications_active</span>
</div>
<h4 className="text-base font-bold text-white">Alertes WhatsApp &amp; SMS</h4>
<p className="text-xs text-slate-300 leading-relaxed font-body">
        Recevez une notification instantanée dès que votre colis franchit chaque étape charnière (enregistrement, décollage et mise à disposition à Antananarivo).
      </p>
</div>
</section>
{toastMessage && <div className="fixed bottom-6 right-6 bg-[#0c1a2e] border border-cyan-400/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50" id="copyToast" role="status">
<span className="material-symbols-outlined text-[20px] text-cyan-400">{toastMessage.startsWith('Numéro') ? 'check_circle' : 'info'}</span>
<span className="text-xs font-mono font-medium">{toastMessage}</span>
</div>}
</main>
  );
}
