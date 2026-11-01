import React, { useEffect, useState } from 'react';
import { getOfficialExchangeRate } from '../services/pricing.js';
import { formatDate } from '../utils/dateUtils.js';

export default function ExchangeRate() {
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getOfficialExchangeRate(controller.signal)
      .then((rate) => setExchangeRate(rate))
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') setError(loadError.message || 'Taux indisponible.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const rate = exchangeRate?.rate > 0 ? exchangeRate.rate : null;
  const numericAmount = Number.parseFloat(amount);
  const ariary = rate && Number.isFinite(numericAmount) && numericAmount > 0
    ? `${Math.round(numericAmount * rate).toLocaleString('fr-FR')} ${exchangeRate.targetCurrency}`
    : rate ? '0 Ar' : 'Taux indisponible';

  return (
    <>
      <section className="py-12 bg-night border-b border-border-dark relative" id="taux">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-cyan-glow/20 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-96 h-96 bg-electric/10 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">

              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-cyan-glow tracking-wider">
                  <span className="material-symbols-outlined text-[15px]">currency_exchange</span>
                  EXCHANGE RATE · REGLEMENT FOURNISSEURS
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  Paiement direct de vos commandes en Chine
                </h2>
                <p className="text-sm text-slate-gray leading-relaxed">
                  Simplifiez vos achats sur 1688, Taobao ou auprès de vos usines partenaires. Nous réglons directement vos fournisseurs chinois en Yuan (RMB) en toute conformité.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-gray/80 pt-1">
                  <span className="material-symbols-outlined text-[15px] text-cyan-glow">update</span>
                  <span className="">Mis à jour manuellement par l'équipe CoreLink</span>
                </div>
              </div>

              <div className="w-full lg:w-auto bg-navy/80 rounded-xl p-5 sm:p-6 border border-white/10 flex flex-col sm:flex-row items-center gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider block">COURS DU JOUR OFFICIEL</span>
                  <div className="text-3xl sm:text-2xl font-mono font-bold text-cyan-glow tracking-tight mt-1">
                    {loading ? 'Chargement…' : rate ? `1 ${exchangeRate.sourceCurrency} = ${rate.toLocaleString('fr-FR')} ${exchangeRate.targetCurrency}` : 'Taux indisponible'}
                  </div>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-delivered/10 border border-delivered/20 text-delivered text-[11px] font-mono">
                    {error || (exchangeRate ? `Mis à jour le ${formatDate(exchangeRate.effectiveDate)}` : 'Aucun taux actif')}
                  </span>
                </div>
                <div className="w-full sm:w-[1px] h-[1px] sm:h-16 bg-white/10"></div>

                <div className="w-full sm:w-64 space-y-2">
                  <label className="text-[11px] font-mono text-slate-gray block uppercase">Calcul rapide (RMB ➔ Ariary)</label>
                  <div className="flex items-center gap-2">
                    <input className="w-28 px-2.5 py-2 rounded-lg bg-night border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-glow" disabled={!rate} id="rmb-calc-input" min="0" onChange={(event) => setAmount(event.target.value)} placeholder="Montant en ¥" type="number" value={amount} />
                    <span className="text-xs font-mono text-slate-gray">=</span>
                    <span className="text-xs font-mono font-bold text-white" id="rmb-calc-output">{ariary}</span>
                  </div>
                  <a className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-glow hover:underline pt-1" href="#contact">
                    Contacter pour un virement
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
