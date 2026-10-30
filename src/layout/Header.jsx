import React, { useState } from 'react';
import logo from '../assets/images/logo.png';

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-50 bg-night/85 backdrop-blur-xl border-b border-border-dark transition-all">
				<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

					<a className="flex items-center gap-3.5 group text-decoration-none" href="/">
						<img
							alt="CoreLink Sourcing & Logistics"
							className="h-14 w-14 rounded-lg bg-white object-contain p-1"
							height="56"
							src={logo}
							width="56"
						/>
						<span className="flex flex-col">
							<span className="font-display font-bold text-[17px] text-white tracking-tight leading-none group-hover:text-cyan-glow transition-colors">
								CoreLink
							</span>
							<span className="mt-1 text-[11px] font-mono text-slate-gray">Sourcing &amp; Logistics</span>
						</span>
					</a>

					<nav className="hidden lg:flex items-center gap-8">
						<a className="text-sm font-medium text-white hover:text-cyan-glow transition-colors" href="/#accueil">Accueil</a>

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
