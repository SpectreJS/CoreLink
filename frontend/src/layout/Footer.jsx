import React from 'react';
import logo from '../assets/images/logo.png';

const currentYear = new Date().getFullYear();

export default function Footer() {
	return (
		<>
			<footer className="bg-night border-t border-border-dark text-slate-gray text-xs font-mono">
				<div className="max-w-7xl mx-auto px-6 py-12">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

						<div className="flex items-start gap-4">
							<img
								alt="CoreLink Sourcing & Logistics"
								className="h-[150px] w-[150px] shrink-0 rounded-lg bg-white object-contain p-1"
								height="150"
								src={logo}
								width="150"
							/>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="font-display font-bold text-base text-white">CoreLink Sourcing &amp; Logistics</span>
									<span className="px-1.5 py-0.5 rounded bg-cyan-glow/10 text-cyan-glow text-[10px]">Transit Chine - Madagascar</span>
								</div>
								<p className="text-slate-gray/80 max-w-md text-xs font-sans">
									Expédition aérienne express, groupage maritime sécurisé et service de paiement direct pour fournisseurs en Chine.
								</p>
							</div>
						</div>

					</div>

					<div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-gray/70">
						<span className="">© <span id="current-year" className="">{currentYear}</span> CoreLink Sourcing &amp; Logistics. Tous droits réservés.</span>
						<span className="flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow"></span>
							Build & Design with ❤︎⁠ by <a href="x-orion.fr">x-orion</a>
						</span>
					</div>
				</div>
			</footer>

		</>
	);
}
