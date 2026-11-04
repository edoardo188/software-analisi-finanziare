import React, { useState } from 'react';
import { BondGovernmentItem, BondCorporateItem } from '../../types';
import { INITIAL_GOV_BONDS, INITIAL_CORP_BONDS } from '../../data/marketData';
import { ArrowUpDown, Landmark, ShieldCheck } from 'lucide-react';

export const BondsView: React.FC = () => {
  const [govBonds, setGovBonds] = useState<BondGovernmentItem[]>(INITIAL_GOV_BONDS);
  const [corpBonds, setCorpBonds] = useState<BondCorporateItem[]>(INITIAL_CORP_BONDS);
  const [selectedCountry, setSelectedCountry] = useState<string>('Tutti');

  const countries = ['Tutti', ...Array.from(new Set(INITIAL_GOV_BONDS.map((b) => b.country)))];

  const filteredGov = selectedCountry === 'Tutti'
    ? govBonds
    : govBonds.filter((b) => b.country === selectedCountry);

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          MERCATO OBBLIGAZIONARIO E SPREAD
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Rendimenti governativi globali e credito corporate
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Monitoraggio delle curve dei tassi a 2, 10 e 30 anni per Stati Uniti, Europa e Asia, integrato con i premi per il rischio di credito aziendale (AAA, BBB e High Yield).
        </p>
      </div>

      {/* Government Bonds Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#15231f]/5">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#15231f]" />
            <h3 className="serif-brand font-bold text-base text-[#15231f]">
              Titoli di Stato Sovrani (2Y, 10Y, 30Y)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64716c]">Paese:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#15231f]/15 bg-white font-medium"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Paese / Area</th>
                <th className="py-3 px-4">Scadenza</th>
                <th className="py-3 px-4">Simbolo</th>
                <th className="py-3 px-4">Rendimento Corrente</th>
                <th className="py-3 px-4">Variazione Giornaliera (pb)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15231f]/5">
              {filteredGov.map((bond, idx) => (
                <tr key={idx} className="hover:bg-[#f7f5ef]/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#15231f]">{bond.country} ({bond.area})</td>
                  <td className="py-3 px-4">
                    <span className="mono-num font-bold px-2 py-0.5 rounded bg-[#15231f]/5 text-[#15231f]">
                      {bond.maturity}
                    </span>
                  </td>
                  <td className="py-3 px-4 mono-num text-[#64716c]">{bond.symbol}</td>
                  <td className="py-3 px-4 mono-num font-extrabold text-sm text-[#15231f]">
                    {bond.yieldValue.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-bold ${
                      bond.daily_bps >= 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {bond.daily_bps >= 0 ? '+' : ''}
                    {bond.daily_bps.toFixed(1)} pb
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Bonds Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#15231f]/5">
          <ShieldCheck className="w-4 h-4 text-[#15231f]" />
          <h3 className="serif-brand font-bold text-base text-[#15231f]">
            Indici Obbligazionari Corporate USA e Spread Creditizi
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {corpBonds.map((corp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#f7f5ef]/60 border border-[#15231f]/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#64716c]">{corp.rating}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    corp.risk === 'Basso'
                      ? 'bg-emerald-100 text-emerald-800'
                      : corp.risk === 'Medio'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Rischio {corp.risk}
                </span>
              </div>

              <div>
                <strong className="text-sm font-bold text-[#15231f] block">{corp.name}</strong>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="mono-num text-xl font-extrabold text-[#15231f]">
                    {corp.yieldValue.toFixed(2)}%
                  </span>
                  <span className="mono-num text-xs text-[#64716c]">
                    Spread: <strong>{corp.spread_bps} pb</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#15231f]/5 flex items-center justify-between text-[11px] text-[#64716c]">
                <span>Movimento giornaliero:</span>
                <span
                  className={`mono-num font-bold ${
                    corp.daily_bps >= 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {corp.daily_bps >= 0 ? '+' : ''}
                  {corp.daily_bps.toFixed(1)} pb
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
