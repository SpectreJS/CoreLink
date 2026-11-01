import React from 'react';

export default function Advantages() {
	return (
		<>
			<section className="py-20 bg-night border-b border-border-dark relative" id="avantages">
				<div className="max-w-7xl mx-auto px-6">
					<div className="space-y-3 mb-14">
						<span className="text-xs font-mono uppercase tracking-widest text-cyan-glow block">02 / WHY CORELINK</span>
						<h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
							Pourquoi faire confiance à CoreLink ?
						</h2>
						<p className="text-slate-gray text-sm sm:text-base max-w-xl">
							Une infrastructure logistique intégrée de bout en bout pour sécuriser et accélérer vos flux d'importation.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

						<div className="glass-card rounded-2xl p-7 border border-white/10 hover:border-cyan-glow/40 transition-all flex flex-col justify-between group">
							<div className="space-y-4">
								<div className="w-12 h-12 rounded-xl bg-navy border border-cyan-glow/30 text-cyan-glow flex items-center justify-center group-hover:scale-105 transition-transform">
									<span className="material-symbols-outlined text-[26px]">local_shipping</span>
								</div>
								<span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider block">01 / TRAÇABILITÉ TEMPS RÉEL</span>
								<h3 className="text-xl font-display font-bold text-white">Suivi à jour</h3>
								<p className="text-slate-gray text-sm leading-relaxed">
									Chaque étape de transit est enregistrée et mise à jour directement depuis nos centres logistiques. Vous gardez une vision claire de votre fret à tout instant.
								</p>
							</div>

							<div className="mt-8 pt-5 border-t border-white/10 space-y-2">
								<div className="flex justify-between text-[11px] font-mono text-slate-gray">
									<span className="">Scan Entrepôt</span>
									<span className="text-cyan-glow">Transit</span>
									<span className="">Dépôt TNR</span>
								</div>
								<div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
									<div className="h-full bg-gradient-to-r from-electric to-cyan-glow rounded-full w-2/3"></div>
								</div>
							</div>
						</div>

						<div className="glass-card rounded-2xl p-7 border border-white/10 hover:border-cyan-glow/40 transition-all flex flex-col justify-between group">
							<div className="space-y-4">
								<div className="w-12 h-12 rounded-xl bg-navy border border-electric/40 text-electric flex items-center justify-center group-hover:scale-105 transition-transform">
									<span className="material-symbols-outlined text-[26px]">headset_mic</span>
								</div>
								<span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider block">02 / ACCOMPAGNEMENT 6J/7</span>
								<h3 className="text-xl font-display font-bold text-white">Une équipe disponible</h3>
								<p className="text-slate-gray text-sm leading-relaxed">
									Une question sur votre envoi ? Notre service client répond du lundi au samedi pour vous guider, traiter les formalités douanières et coordonner la remise finale.
								</p>
							</div>

							<div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
								<span className="text-[11px] font-mono text-slate-gray">Support Bilingue MG / FR</span>
								<span className="px-2 py-0.5 rounded bg-delivered/10 text-delivered border border-delivered/20 text-[10px] font-mono">
									RÉPONSE &lt; 30 MIN
								</span>
							</div>
						</div>

						<div className="glass-card rounded-2xl p-7 border border-white/10 hover:border-cyan-glow/40 transition-all flex flex-col justify-between group">
							<div className="space-y-4">
								<div className="w-12 h-12 rounded-xl bg-navy border border-cyan-glow/30 text-cyan-glow flex items-center justify-center group-hover:scale-105 transition-transform">
									<span className="material-symbols-outlined text-[26px]">public</span>
								</div>
								<span className="text-[11px] font-mono uppercase text-slate-gray tracking-wider block">03 / CORRIDOR GLOBAL</span>
								<h3 className="text-xl font-display font-bold text-white">Réseau international</h3>
								<p className="text-slate-gray text-sm leading-relaxed">
									CoreLink Sourcing &amp; Logistics assure le suivi de vos colis par voie aérienne et maritime, à travers son réseau de partenaires en Chine et à l'international.
								</p>
							</div>

							<div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap gap-1.5">
								<span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white">Guangzhou Hub</span>
								<span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white">Yiwu Center</span>
								<span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-glow">Toamasina Port</span>
							</div>
						</div>
					</div>
				</div>
			</section>

		</>
	);
}
