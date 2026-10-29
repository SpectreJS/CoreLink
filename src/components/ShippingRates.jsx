import React from 'react';

export default function ShippingRates() {
  return (
    <>
<section className="py-20 bg-night border-b border-border-dark tech-grid relative" id="tarifs">
<div className="max-w-7xl mx-auto px-6">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
<div className="space-y-3">
<span className="text-xs font-mono uppercase tracking-widest text-cyan-glow block">01 / SHIPPING RATES</span>
<h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Nos tarifs d'expédition
        </h2>
<p className="text-slate-gray text-sm sm:text-base max-w-2xl">
          Prix indicatifs selon le type de marchandise et le mode de transport. Un devis précis peut varier selon le volume, le poids et la destination.
        </p>
</div>
<div>
<a className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all" href="#contact">
<span className="">Demander un devis</span>
<span className="material-symbols-outlined text-[16px] text-cyan-glow">arrow_forward</span>
</a>
</div>
</div>

<div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-navy/70 border-b border-white/10 font-mono text-[11px] text-slate-gray uppercase tracking-wider">
<th className="py-4 px-6 font-medium">Catégorie de marchandise</th>
<th className="py-4 px-6 font-medium">Mode &amp; Unité</th>
<th className="py-4 px-6 font-medium text-right">Tarif indicatif</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5 text-sm">
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">📦</span>
<span className="">Marchandises générales</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Aérien régulier / kg</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">70 000 – 75 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors bg-cyan-glow/[0.02] group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">✈️</span>
<span className="">Express</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Prioritaire rapide / kg</td>
<td className="py-4 px-6 text-right font-mono font-bold text-cyan-glow tracking-tight">82 500 – 100 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">🔋</span>
<span className="">Produits avec batterie</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Fret sécurisé DG / kg</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">100 000 – 120 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">📱</span>
<span className="">Smartphones</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Haute valeur déclarée / pièce</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">80 000 – 100 000 Ar/pièce</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">🧴</span>
<span className="">Cosmétiques (crèmes, maquillage, shampoing)</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Ligne spécialisée / kg</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">75 000 – 95 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">💄</span>
<span className="">Liquides, poudres, parfums</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Règlementation spéciale / kg</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">75 000 – 95 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">💻</span>
<span className="">Électronique sensible</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Protection anti-choc / kg</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">78 000 – 120 000 Ar/kg</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors bg-navy/30 group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">🚢</span>
<span className="">Fret maritime (marchandises générales)</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Conteneur LCL/FCL / m³ (CBM)</td>
<td className="py-4 px-6 text-right font-mono font-bold text-cyan-glow tracking-tight">355 – 390 USD/m³</td>
</tr>
<tr className="hover:bg-white/[0.03] transition-colors bg-navy/30 group">
<td className="py-4 px-6 flex items-center gap-3 text-white font-medium">
<span className="text-xl">🚢</span>
<span className="">Maritime (batteries ou marchandises spéciales)</span>
</td>
<td className="py-4 px-6 font-mono text-xs text-slate-gray">Matières soumises / m³ (CBM)</td>
<td className="py-4 px-6 text-right font-mono font-semibold text-white tracking-tight">400 – 420 USD/m³</td>
</tr>
</tbody>
</table>
</div>

<div className="p-4 sm:p-5 bg-navy/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
<p className="text-xs text-slate-gray flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-cyan-glow">verified</span>
          Tarifs donnés à titre indicatif et susceptibles d'évoluer. Contactez notre équipe pour un devis personnalisé.
        </p>
<a className="text-xs font-mono uppercase tracking-wider text-cyan-glow hover:text-white transition-colors flex items-center gap-1" href="#contact">
          Obtenir une cotation détaillée
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
</a>
</div>
</div>
</div>
</section>


    </>
  );
}
