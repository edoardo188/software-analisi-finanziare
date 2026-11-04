import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Eye, CheckCircle2 } from 'lucide-react';

export const WeeklyMacro: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Weekly Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          PANORAMA MACRO SETTIMANALE
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Politica monetaria, trimestrali e tenuta del ciclo economico
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          La settimana vede una rotazione costruttiva tra i settori ciclici e una decisa tenuta degli indici azionari mondiali. La correlazione inversa tra tassi e azioni si attenua grazie alla solidità dei profitti operativi aziendali.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Osservazioni chiave */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#15231f]/5">
            <Eye className="w-4 h-4 text-[#15231f]" />
            <h3 className="serif-brand font-bold text-sm text-[#15231f]">
              Osservazioni macroeconomiche principali
            </h3>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-[#64716c]">
            <div className="p-3.5 rounded-2xl bg-[#f7f5ef] border border-[#15231f]/5">
              <strong className="text-[#15231f] block mb-1">1. Fed & Curva dei tassi USA</strong>
              <p>
                I future sui Fed Funds prezzano con probabilità superiore al 70% un taglio di 25 punti base entro la fine del trimestre. La parte a 2 anni (4.18%) si attesta sotto la parte a 10 anni (4.28%), con la curva 10Y–2Y stabilmente positiva a +10 pb dopo il lungo periodo di disinversione.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f7f5ef] border border-[#15231f]/5">
              <strong className="text-[#15231f] block mb-1">2. Mercato del lavoro e consumi</strong>
              <p>
                I dati sui non-farm payrolls mostrano una normalizzazione ordinata dell'occupazione, evitando gli scenari estremi di surriscaldamento o repentina recessione ("soft landing").
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f7f5ef] border border-[#15231f]/5">
              <strong className="text-[#15231f] block mb-1">3. Materie prime ed energia</strong>
              <p>
                Il petrolio WTI rimane ancorato sotto i 73$ al barile, contribuendo a ridurre le pressioni inflazionistiche sui prezzi alla produzione (PPI), mentre l'oro consolida sui massimi storici sostenuto dagli acquisti strategici delle banche centrali.
              </p>
            </div>
          </div>
        </div>

        {/* Leaders vs Laggards */}
        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#15231f]/5">
              <h3 className="serif-brand font-bold text-sm text-[#15231f]">
                Leader e laggard settimanali
              </h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Settori in espansione
              </span>
              <ul className="text-xs space-y-1.5 text-[#15231f] font-medium">
                <li className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60">
                  <span>Tecnologia & Hardware (XLK)</span>
                  <span className="mono-num text-emerald-700 font-bold">+2.15%</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60">
                  <span>Servizi di Comunicazione (XLC)</span>
                  <span className="mono-num text-emerald-700 font-bold">+1.85%</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60">
                  <span>Crypto & Digital Assets (BTC)</span>
                  <span className="mono-num text-emerald-700 font-bold">+2.15%</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-rose-800 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Settori in ritirata
              </span>
              <ul className="text-xs space-y-1.5 text-[#15231f] font-medium">
                <li className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60">
                  <span>Energia & Petroliferi (XLE)</span>
                  <span className="mono-num text-rose-700 font-bold">-2.15%</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60">
                  <span>Utility regolamentate (XLU)</span>
                  <span className="mono-num text-rose-700 font-bold">-1.05%</span>
                </li>
                <li className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60">
                  <span>Beni di prima necessità (XLP)</span>
                  <span className="mono-num text-rose-700 font-bold">-0.92%</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#15231f] text-white text-[11px] space-y-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sintesi operativa
            </span>
            <p className="text-white/80">
              Favorita l'esposizione sui trend strutturali tech con protezione tramite opzioni Put OTM su indici ad alta duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
