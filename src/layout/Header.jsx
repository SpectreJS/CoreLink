import React, { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
<header className="sticky top-0 z-50 bg-night/85 backdrop-blur-xl border-b border-border-dark transition-all">
<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

<a className="flex items-center gap-3.5 group text-decoration-none" href="/">
<div className="w-10 h-10 rounded-lg bg-navy border border-cyan-glow/30 flex items-center justify-center text-cyan-glow group-hover:border-cyan-glow group-hover:shadow-[0_0_15px_rgba(86,217,245,0.4)] transition-all duration-200">
<span className="material-symbols-outlined text-[22px]">deployed_code</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-display font-bold text-[17px] text-white tracking-tight leading-none group-hover:text-cyan-glow transition-colors">CoreLink</span>
<span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-gray">Logistics</span>
</div>
<div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-gray">
<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse"></span>
<span className="">Chine · Madagascar</span>
</div>
</div>
</a>

<nav className="hidden lg:flex items-center gap-8">
<a className="text-sm font-medium text-white hover:text-cyan-glow transition-colors" href="/#accueil">Accueil</a>
<a className="text-sm font-medium text-slate-gray hover:text-white transition-colors" href="/details.html">Suivi de colis</a>
<a className="text-sm font-medium text-slate-gray hover:text-white transition-colors" href="/#tarifs">Nos tarifs</a>
<a className="text-sm font-medium text-slate-gray hover:text-white transition-colors" href="/#avantages">Pourquoi CoreLink</a>
<a className="text-sm font-medium text-slate-gray hover:text-white transition-colors" href="/#taux">Taux RMB</a>
<a className="text-sm font-medium text-slate-gray hover:text-white transition-colors" href="/#contact">Contact</a>
</nav>

<div className="hidden sm:flex items-center gap-3">
<a className="px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider text-cold-gray/80 hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all" href="/#contact">
        Demander un devis
      </a>
<a className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-night bg-cyan-glow hover:bg-white hover:shadow-[0_0_20px_rgba(86,217,245,0.4)] transition-all flex items-center gap-1.5" href="/details.html">
<span className="material-symbols-outlined text-[16px]">radar</span>
        Suivre un colis
      </a>
</div>

<button aria-label="Toggle menu" aria-expanded={menuOpen} className="lg:hidden p-2 text-slate-gray hover:text-white" id="mobile-toggle" onClick={() => setMenuOpen((open) => !open)}>
<span className="material-symbols-outlined text-[26px]">menu</span>
</button>
</div>

<div className={`${menuOpen ? 'block' : 'hidden'} lg:hidden border-t border-border-dark bg-night/95 backdrop-blur-2xl px-6 py-5 space-y-4`} id="mobile-menu">
<nav className="flex flex-col space-y-3 font-mono text-sm" onClick={() => setMenuOpen(false)}>
<a className="text-cyan-glow" href="/#accueil">00 / ACCUEIL</a>
<a className="text-slate-gray hover:text-white" href="/details.html">01 / SUIVI DE COLIS</a>
<a className="text-slate-gray hover:text-white" href="/#tarifs">02 / NOS TARIFS</a>
<a className="text-slate-gray hover:text-white" href="/#avantages">03 / POURQUOI CORELINK</a>
<a className="text-slate-gray hover:text-white" href="/#taux">04 / TAUX DE CHANGE</a>
<a className="text-slate-gray hover:text-white" href="/#contact">05 / CONTACT</a>
</nav>
<div className="pt-3 border-t border-border-dark flex flex-col gap-2" onClick={() => setMenuOpen(false)}>
<a className="w-full text-center py-2.5 bg-cyan-glow text-night font-bold text-xs uppercase tracking-wider rounded-lg" href="/details.html">Suivre un colis</a>
<a className="w-full text-center py-2.5 border border-white/15 text-white font-medium text-xs uppercase tracking-wider rounded-lg" href="/#contact">Demander un devis</a>
</div>
</div>
</header>

    </>
  );
}
