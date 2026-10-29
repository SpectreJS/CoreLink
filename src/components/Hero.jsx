import React, { useEffect, useRef, useState } from 'react';
import Globe from './Globe.jsx';

export default function Hero() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingState, setTrackingState] = useState('idle');
  const timeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const searchTracking = (value = trackingNumber) => {
    const normalized = value.trim().toUpperCase();
    window.clearTimeout(timeoutRef.current);
    setTrackingNumber(normalized);

    if (!normalized) {
      setTrackingState('error');
      return;
    }

    setTrackingState('loading');
    timeoutRef.current = window.setTimeout(() => {
      setTrackingState(normalized.startsWith('CL') || normalized.length >= 5 ? 'results' : 'error');
    }, 600);
  };

  const clearTracking = () => {
    window.clearTimeout(timeoutRef.current);
    setTrackingNumber('');
    setTrackingState('idle');
  };

  return (
    <>
<section className="relative min-h-[calc(100vh-80px)] flex items-center tech-grid radial-glow overflow-hidden border-b border-border-dark" id="accueil">

<div className="absolute top-4 left-6 right-6 hidden md:flex items-center justify-between text-[11px] font-mono text-slate-gray/70 pointer-events-none select-none">
<span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-glow"></span> CAN HUB 23.1291° N, 113.2644° E</span>
<span className="tracking-widest uppercase text-[10px] text-cyan-glow/60">TRANS-OCEANIC COURIER ROUTE · INDIAN OCEAN CORRIDOR</span>
<span className="flex items-center gap-1.5">TNR HUB 18.8792° S, 47.5079° E <span className="w-1.5 h-1.5 rounded-full bg-electric"></span></span>
</div>
<div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

<div className="lg:col-span-7 space-y-7">
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy/80 border border-cyan-glow/20 text-cyan-glow text-[11px] font-mono tracking-wider uppercase">
<span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
          GLOBAL LOGISTICS · MADAGASCAR · CHINA
        </div>
<div className="space-y-3">
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-[1.1]">
            Où en est <br />
<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-glow to-electric">votre envoi ?</span>
</h1>
<p className="text-slate-gray text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            Entrez votre numéro de suivi pour connaître la position exacte et le statut de votre colis, où qu'il se trouve dans le monde.
          </p>
</div>

<div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl relative" id="suivi">
<div className="flex items-center justify-between text-[11px] font-mono text-slate-gray mb-3">
<span className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-delivered"></span>
              SYSTÈME DE TRAÇABILITÉ EN DIRECT
            </span>
<button className="text-cyan-glow cursor-pointer hover:underline border-0 bg-transparent p-0 font-mono" onClick={() => searchTracking('CL123456789')} type="button">Test démo: CL123456789</button>
</div>
<form className="space-y-3" id="tracking-form" onSubmit={(event) => { event.preventDefault(); searchTracking(); }}>
<div className="relative flex flex-col sm:flex-row gap-2.5">
<div className="relative flex-1">
<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-gray">
<span className="material-symbols-outlined text-[20px]">search</span>
</span>
<input autoComplete="off" className="w-full pl-10 pr-9 py-3.5 rounded-xl bg-night/80 border border-white/10 text-white font-mono text-sm placeholder:text-slate-gray/60 focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow transition-all uppercase tracking-wider" id="tracking-input" onChange={(event) => { setTrackingNumber(event.target.value); setTrackingState('idle'); }} placeholder="Exemple : CL123456789" spellCheck="false" type="text" value={trackingNumber} />
<button className={`${trackingNumber ? '' : 'hidden'} absolute inset-y-0 right-0 pr-3 flex items-center text-slate-gray hover:text-white`} id="clear-input-btn" onClick={clearTracking} type="button">
<span className="material-symbols-outlined text-[18px]">cancel</span>
</button>
</div>
<button className="px-6 py-3.5 rounded-xl bg-cyan-glow hover:bg-white text-night font-display font-bold text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(86,217,245,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2" id="tracking-submit-btn" type="submit">
<span className="material-symbols-outlined text-[18px]">radar</span>
<span className="">Suivre le colis</span>
</button>
</div>
<p className="text-[12px] text-slate-gray font-sans flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px] text-cyan-glow/80">info</span>
              Le numéro de suivi figure sur votre reçu d'expédition.
            </p>
</form>

{trackingState === 'loading' && <div className="flex py-8 flex-col items-center justify-center space-y-3 text-center" id="tracking-loading">
<div className="w-8 h-8 rounded-full border-2 border-cyan-glow border-t-transparent animate-spin"></div>
<p className="text-xs font-mono text-cyan-glow tracking-wider animate-pulse">INTERROGATION DES HUBS GUANGZHOU &amp; ANTANANARIVO...</p>
</div>}

{trackingState === 'results' && <div className="mt-5 pt-5 border-t border-white/10 space-y-4" id="tracking-results">
<div className="p-3.5 rounded-xl bg-night/70 border border-white/10 flex flex-wrap items-center justify-between gap-3">
<div>
<span className="text-[10px] font-mono uppercase text-slate-gray block">Bordereau</span>
<span className="text-sm font-mono font-bold text-white tracking-wider" id="res-tracking-id">{trackingNumber}</span>
</div>
<div>
<span className="text-[10px] font-mono uppercase text-slate-gray block">Trajet</span>
<span className="text-xs font-semibold text-cyan-glow">CAN (Guangzhou) ➔ TNR (Ivato)</span>
</div>
<div className="flex items-center gap-2">
<span className="px-2.5 py-1 rounded-full bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/30 text-[11px] font-mono flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping"></span>
                  En transit maritime / aérien
                </span>
</div>
</div>

<div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">

<div className="relative">
<div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-cyan-glow ring-4 ring-cyan-glow/20"></div>
<div className="space-y-0.5">
<div className="flex items-center justify-between text-xs">
<span className="font-bold text-white">Toamasina / Antananarivo Distribution</span>
<span className="text-[10px] font-mono text-cyan-glow font-medium">Étape en cours</span>
</div>
<p className="text-[12px] text-slate-gray">Vérification douanière en cours et préparation au bureau central de Behintsy.</p>
<span className="text-[10px] font-mono text-slate-gray/70 block">Aujourd'hui · 09:30 UTC+3 — Antananarivo</span>
</div>
</div>

<div className="relative">
<div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-delivered"></div>
<div className="space-y-0.5">
<div className="flex items-center justify-between text-xs">
<span className="font-bold text-white">Air / Maritime Cargo in Transit</span>
<span className="text-[10px] font-mono text-delivered">Validé</span>
</div>
<p className="text-[12px] text-slate-gray">Traversée internationale Océan Indien confirmée par manifeste de vol.</p>
<span className="text-[10px] font-mono text-slate-gray/70 block">23 Octobre · 21:15 — Corridor Cargo</span>
</div>
</div>

<div className="relative">
<div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-delivered"></div>
<div className="space-y-0.5">
<div className="flex items-center justify-between text-xs">
<span className="font-bold text-white">Export Customs Cleared (Chine)</span>
<span className="text-[10px] font-mono text-delivered">Validé</span>
</div>
<p className="text-[12px] text-slate-gray">Contrôle de conformité et scellage douanier certifié.</p>
<span className="text-[10px] font-mono text-slate-gray/70 block">21 Octobre · 17:40 — Port / Aéroport CAN</span>
</div>
</div>

<div className="relative">
<div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-delivered"></div>
<div className="space-y-0.5">
<div className="flex items-center justify-between text-xs">
<span className="font-bold text-white">Guangzhou Hub Reception</span>
<span className="text-[10px] font-mono text-delivered">Validé</span>
</div>
<p className="text-[12px] text-slate-gray">Réception fournisseur (1688/Taobao), pesée volumétrique et étiquetage.</p>
<span className="text-[10px] font-mono text-slate-gray/70 block">19 Octobre · 11:20 — Baiyun Logistics Hub</span>
</div>
</div>
</div>
</div>}

{trackingState === 'error' && <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3" id="tracking-error">
<span className="material-symbols-outlined text-[20px] text-red-400">error</span>
<div className="">Numéro introuvable. Utilisez le numéro démo <button className="font-mono underline cursor-pointer border-0 bg-transparent p-0 text-red-200" onClick={() => searchTracking('CL123456789')} type="button">CL123456789</button> pour tester la visualisation.</div>
</div>}
</div>
</div>

<div className="lg:col-span-5 relative flex items-center justify-center">

<div className="absolute -inset-4 bg-gradient-to-tr from-cyan-glow/20 via-electric/15 to-transparent rounded-full filter blur-3xl pointer-events-none"></div>

<div className="absolute top-2 right-2 sm:right-6 z-20 px-3 py-1.5 rounded-lg bg-navy/80 border border-cyan-glow/30 backdrop-blur-md text-[11px] font-mono text-cyan-glow shadow-lg flex items-center gap-1.5 animate-bounce" style={{ animationDuration: '4s' }}>
<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow"></span>
          Guangzhou Hub (CAN)
        </div>
<div className="absolute bottom-6 left-2 sm:left-6 z-20 px-3 py-1.5 rounded-lg bg-navy/80 border border-electric/40 backdrop-blur-md text-[11px] font-mono text-white shadow-lg flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-electric"></span>
          Antananarivo Depot (TNR)
        </div>

<Globe />
</div>
</div>
</div>
</section>

    </>
  );
}
