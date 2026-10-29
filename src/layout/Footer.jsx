import React from 'react';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <>
<footer className="bg-night border-t border-border-dark text-slate-gray text-xs font-mono">
<div className="max-w-7xl mx-auto px-6 py-12">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

<div className="space-y-2">
<div className="flex items-center gap-2">
<span className="font-display font-bold text-base text-white">CoreLink Sourcing &amp; Logistics</span>
<span className="px-1.5 py-0.5 rounded bg-cyan-glow/10 text-cyan-glow text-[10px]">Transit Chine - Madagascar</span>
</div>
<p className="text-slate-gray/80 max-w-md text-xs font-sans">
          Expédition aérienne express, groupage maritime sécurisé et service de paiement direct pour fournisseurs en Chine.
        </p>
</div>

<div className="flex flex-wrap gap-6 text-xs">
<a className="hover:text-white transition-colors" href="/#accueil">Accueil</a>
<a className="hover:text-white transition-colors" href="/details.html">Suivi</a>
<a className="hover:text-white transition-colors" href="/#tarifs">Tarifs</a>
<a className="hover:text-white transition-colors" href="/#avantages">Pourquoi CoreLink</a>
<a className="hover:text-white transition-colors" href="/#taux">Taux RMB</a>
<a className="hover:text-white transition-colors" href="/#contact">Contact</a>
</div>
</div>

<div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-gray/70">
<span className="">© <span id="current-year" className="">{currentYear}</span> CoreLink Sourcing &amp; Logistics. Tous droits réservés.</span>
<span className="flex items-center gap-1.5">
<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow"></span>
        Infrastructure de suivi certifiée · Guangzhou ⇄ Antananarivo
      </span>
</div>
</div>
</footer>

    </>
  );
}
