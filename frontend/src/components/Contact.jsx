import React from 'react';

export default function Contact() {
  return (
    <>
      <section className="py-20 bg-night border-b border-border-dark tech-grid relative" id="contact">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-3 mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-glow block">03 / GET IN TOUCH</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Nous contacter
            </h2>
            <p className="text-slate-gray text-sm sm:text-base max-w-xl">
              Notre équipe commerciale et technique est à votre écoute pour organiser vos enlèvements et suivre vos cargaisons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-glow/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-navy text-cyan-glow flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider block">Ligne directe / WhatsApp</span>
              <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">Téléphone</h3>
              <p className="text-slate-gray text-xs mb-4">Joignable du lundi au samedi pour toute question relative aux réceptions et départs.</p>
              <a className="inline-flex items-center gap-2 text-sm font-mono font-bold text-cyan-glow hover:underline" href="tel:+261386843085">
                <span className="material-symbols-outlined text-[16px]">call</span>
                +261 38 68 430 85
              </a>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-glow/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-navy text-cyan-glow flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider block">Messagerie centrale</span>
              <h3 className="text-lg font-display font-bold text-white mt-1 mb-2">E-mail</h3>
              <p className="text-slate-gray text-xs mb-4">Envoyez vos factures proforma, listes de colisage et demandes de cotation.</p>
              <a className="inline-flex items-center gap-2 text-xs font-mono text-cyan-glow hover:underline break-all" href="mailto:corelinksourcinglogistics@gmail.com">
                <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                corelinksourcinglogistics@gmail.com
              </a>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-glow/40 transition-all lg:row-span-2 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider block">Communauté &amp; Départs</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">Facebook</h3>
                <p className="text-xs font-mono text-cyan-glow mt-0.5">CoreLink Sourcing &amp; Logistics</p>
                <p className="text-xs text-slate-gray mt-2 mb-4">
                  Scannez le QR code ci-dessous pour nous suivre et retrouver nos annonces de départs de conteneurs :
                </p>

                <div className="bg-night/90 p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center my-2">
                  <div className="w-36 h-36 bg-white p-2 rounded-lg flex items-center justify-center overflow-hidden shadow-inner">
                    <img alt="QR Code Facebook CoreLink" className="w-full h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABr1icNylCPlgBfFDBxKTucl85jsEoVZnlnzfGo2LQ-GAXUj-lH7jlyENg7-J7Y2AfdwGGVK2lC9oMIIGzEdO4DW2bLh9V_howVxwH29byMJFrMwX82PrBAF3kE9vO7BNdreipKOz4gelTwFhsXAOy9JV23YuJMp7e9WE-UpWNFsw_TfUsQMzo4C2YE_SVNR1xGpDsXlER0mkDSMyqSsR7ykOXCb4qGKtBJpMie04" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-gray mt-2">Scanner avec l'appareil photo</span>
                </div>
              </div>
              <a className="w-full mt-4 py-2.5 px-4 bg-[#1877f2] text-white rounded-xl font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 hover:bg-[#166fe5] transition-all shadow-md" href="https://facebook.com" rel="noopener noreferrer" target="_blank">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                Suivez-nous sur Facebook
              </a>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-glow/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-navy text-cyan-glow flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider">Bureau &amp; Retrait</span>
                <span className="px-2 py-0.5 rounded bg-delivered/10 text-delivered text-[10px] font-mono">Madagascar</span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Behintsy, Ambohimangakely</h3>
              <p className="text-slate-gray text-xs mb-4">
                Local de distribution, réception des colis arrivés et service d'enlèvement sur place.
              </p>
              <a className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow hover:underline" href="https://maps.google.com/?q=Behintsy+Ambohimangakely+Madagascar" rel="noopener noreferrer" target="_blank">
                <span className="material-symbols-outlined text-[14px]">map</span>
                Voir l'itinéraire d'accès
              </a>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-glow/40 transition-all">
              <div className="w-10 h-10 rounded-lg bg-navy text-cyan-glow flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">warehouse</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-gray tracking-wider">Entrepôt Groupage</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-gray text-[10px] font-mono border border-white/10">
                  Adresse à compléter
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Guangzhou / Yiwu</h3>
              <p className="text-slate-gray text-xs mb-4">
                Chine — Entrepôt partenaire : Adresse détaillée à compléter auprès de nos conseillers avant envoi fournisseur.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-gray/80">
                <span className="material-symbols-outlined text-[14px] text-cyan-glow">lock</span>
                Communiqué lors de la réservation de fret
              </span>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
