import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from './Globe.jsx';
import { findTrackingRecord, normalizeTrackingCode } from '../services/tracking.js';

export default function Hero() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingState, setTrackingState] = useState('idle');
  const [trackingError, setTrackingError] = useState('');
  const requestRef = useRef(null);

  useEffect(() => () => requestRef.current?.abort(), []);

  const searchTracking = async (value = trackingNumber) => {
    const normalized = normalizeTrackingCode(value);
    requestRef.current?.abort();

    if (!normalized) {
      setTrackingError(value.trim()
        ? 'Le code de suivi contient des caractères invalides.'
        : 'Veuillez saisir un numéro de suivi.');
      setTrackingState('error');
      return;
    }

    setTrackingNumber(normalized);
    setTrackingError('');
    setTrackingState('loading');
    const request = new AbortController();
    requestRef.current = request;

    try {
      const record = await findTrackingRecord(normalized, request.signal);
      if (!record) {
        setTrackingError('Aucun colis ne correspond à ce numéro de suivi.');
        setTrackingState('error');
        return;
      }

      navigate(`/tracking/details/${encodeURIComponent(normalized)}`);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setTrackingError(error.message || 'Impossible de vérifier ce numéro de suivi.');
      setTrackingState('error');
    }
  };

  const clearTracking = () => {
    requestRef.current?.abort();
    setTrackingNumber('');
    setTrackingError('');
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
                  Testez la recherche avec un code de démonstration. Ces données sont fictives et ne correspondent pas à des colis réels.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl relative" id="suivi">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-gray mb-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-delivered"></span>
                    SUIVI DE COLIS · MODE DÉMONSTRATION
                  </span>
                </div>
                <form className="space-y-3" id="tracking-form" onSubmit={(event) => { event.preventDefault(); searchTracking(); }}>
                  <div className="relative flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-gray">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                      </span>
                      <input autoComplete="off" className="w-full pl-10 pr-9 py-3.5 rounded-xl bg-night/80 border border-white/10 text-white font-mono text-sm placeholder:text-slate-gray/60 focus:outline-none focus:border-cyan-glow focus:ring-1 focus:ring-cyan-glow transition-all uppercase tracking-wider" id="tracking-input" onChange={(event) => { requestRef.current?.abort(); setTrackingNumber(event.target.value); setTrackingState('idle'); setTrackingError(''); }} placeholder="Exemple : CL-2026-00125" spellCheck="false" type="text" value={trackingNumber} />
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
                    Codes disponibles : CL-2026-00125 et CL123456789.
                  </p>
                </form>

                {trackingState === 'loading' && <div className="flex py-8 flex-col items-center justify-center space-y-3 text-center" id="tracking-loading">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-glow border-t-transparent animate-spin"></div>
                  <p className="text-xs font-mono text-cyan-glow tracking-wider animate-pulse">INTERROGATION DES HUBS GUANGZHOU &amp; ANTANANARIVO...</p>
                </div>}

                {trackingState === 'error' && <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3" id="tracking-error" role="alert">
                  <span className="material-symbols-outlined text-[20px] text-red-400">error</span>
                  <div className="">{trackingError}</div>
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
