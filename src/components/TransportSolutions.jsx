import React from 'react';

export default function TransportSolutions() {
	return (
		<>
			<section className="py-16 bg-night border-b border-border-dark relative overflow-hidden" id="solutions-transport">
				<div className="max-w-7xl mx-auto px-6">

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
						<div className="space-y-3">
							<span className="text-xs font-mono uppercase tracking-widest text-cyan-glow block">MODES D'EXPÉDITION &amp; CORRIDORS</span>
							<h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
								Nos solutions de transport Chine — Madagascar
							</h2>
							<p className="text-slate-gray text-sm sm:text-base max-w-2xl">
								Une double expertise aérienne et maritime adaptée à l'urgence, au volume et à la nature de vos cargaisons avec suivi continu de bout en bout.
							</p>
						</div>
						<div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-gray">
							<span className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse"></span>
							<span className="">Liaisons actives Guangzhou ⇄ Madagascar</span>
						</div>
					</div>


					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

						<div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-glow/40 transition-all duration-300 flex flex-col group">
							<div className="relative h-64 sm:h-72 w-full overflow-hidden bg-navy/60">
								<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiHNO0c_qhXvhrNVVJpglorGuoDPxHGNdRA5SzyWfo03Odo7vO4gdIpFXmeK5nMjuNuYgRKwkHAzhYopWKhOYE90UXdQio2XiI4cT1ZUHSa54cyQncb663xt-zSN3avFPHGVFdvyeVSs_50iXtAYJJzQR6czzbaEXt_vH7-mf2PbuLI7PsfMFgOwR2UR1c3khJqW50w3zG0S93r9fSYqSkvml4QTInw7erDHeYUag" alt="Fret Aérien Express Chine Madagascar - Avion cargo" />
								<div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent"></div>

								<div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
									<span className="px-3 py-1 rounded-full bg-night/80 border border-cyan-glow/30 backdrop-blur-md text-cyan-glow text-[11px] font-mono tracking-wider uppercase flex items-center gap-1.5">
										<span className="material-symbols-outlined text-[14px]">flight</span>
										Fret Aérien Régulier &amp; Express
									</span>
								</div>
								<div className="absolute bottom-4 left-4 z-10">
									<span className="px-2.5 py-1 rounded-full bg-delivered/20 border border-delivered/30 backdrop-blur-md text-delivered text-[11px] font-mono font-medium flex items-center gap-1.5">
										<span className="w-1.5 h-1.5 rounded-full bg-delivered animate-ping"></span>
										Vols directs &amp; réguliers
									</span>
								</div>
							</div>
							<div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
										<span className="">CORRIDOR AÉRIEN RAPIDE</span>
										<span className="text-cyan-glow">CAN ➔ TNR (Ivato)</span>
									</div>
									<h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-cyan-glow transition-colors">
										Transit Aérien Guangzhou — Antananarivo
									</h3>
									<p className="text-slate-gray text-sm leading-relaxed font-sans pt-1">
										Liaisons régulières hebdomadaires sécurisées, traçabilité temps réel pour colis urgents, électronique et échantillons.
									</p>
								</div>
								<div className="pt-4 border-t border-white/10 flex items-center justify-between">
									<span className="text-xs font-mono text-white font-semibold">Délai rapide · Dès 70 000 Ar/kg</span>
									<a className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow hover:underline uppercase tracking-wider font-semibold" href="#tarifs">
										Voir la grille
										<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
									</a>
								</div>
							</div>
						</div>


						<div className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-glow/40 transition-all duration-300 flex flex-col group">
							<div className="relative h-64 sm:h-72 w-full overflow-hidden bg-navy/60">
								<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlRABTybFhBKPbkXHHC2bgX03-6911Dg_neeXqizo9tQjNgim8FiRkmdRzQ0TkhfTBNEda4yiiGMYEGwYulqRGpmg3ta__2p1VXfHBhohen55HvBViBQi6Z1GzXbd6PXp0VdV36zUX2aKtzQa2XlpiqhMWKS6K2xgj2ScaYfNM4H_Jy5kmtVB8oPBb7hDYaAFebCSKGshN6-A0PrxhaMnLmh1UyNYpcplMR-Y4quA" alt="Groupage et Conteneurs Maritimes Chine Toamasina - Navire porte-conteneurs" />
								<div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent"></div>

								<div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
									<span className="px-3 py-1 rounded-full bg-night/80 border border-electric/40 backdrop-blur-md text-white text-[11px] font-mono tracking-wider uppercase flex items-center gap-1.5">
										<span className="material-symbols-outlined text-[14px] text-cyan-glow">directions_boat</span>
										Fret Maritime LCL / FCL
									</span>
								</div>
								<div className="absolute bottom-4 left-4 z-10">
									<span className="px-2.5 py-1 rounded-full bg-electric/20 border border-electric/40 backdrop-blur-md text-cyan-glow text-[11px] font-mono font-medium flex items-center gap-1.5">
										<span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse"></span>
										Départs bimensuels sécurisés
									</span>
								</div>
							</div>
							<div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-[11px] font-mono text-slate-gray">
										<span className="">CORRIDOR MARITIME LCL / FCL</span>
										<span className="text-cyan-glow">CAN / YIWU ➔ TOAMASINA</span>
									</div>
									<h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-cyan-glow transition-colors">
										Corridor Maritime Chine — Toamasina
									</h3>
									<p className="text-slate-gray text-sm leading-relaxed font-sans pt-1">
										Solutions de groupage optimisées et conteneurs complets au départ de Guangzhou et Yiwu vers le port de Toamasina.
									</p>
								</div>
								<div className="pt-4 border-t border-white/10 flex items-center justify-between">
									<span className="text-xs font-mono text-white font-semibold">Économique gros volume · Dès 355 USD/m³</span>
									<a className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow hover:underline uppercase tracking-wider font-semibold" href="#contact">
										Réserver fret
										<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
