import React, { useState } from 'react';
import { EarningsItem } from '../../types';
import { INITIAL_EARNINGS } from '../../data/marketData';
import { Calendar, DollarSign, Filter } from 'lucide-react';

export const EarningsView: React.FC = () => {
  const [sectorFilter, setSectorFilter] = useState<string>('Tutti');
  const [minMarketCap, setMinMarketCap] = useState<number>(0);

  const sectors = ['Tutti', ...Array.from(new Set(INITIAL_EARNINGS.map((e) => e.sector)))];

  const filtered = INITIAL_EARNINGS.filter((e) => {
    if (sectorFilter !== 'Tutti' && e.sector !== sectorFilter) return false;
    if (e.marketCap < minMarketCap) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          CALENDARIO TRIMESTRALI SOCIETARIE
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Utili aziendali, consensus EPS e stime sui ricavi
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Monitoraggio delle trimestrali delle società guida di Wall Street con stime degli analisti, sessione di pubblicazione e sorprese sugli utili.
        </p>
      </div>

      {/* Filters */}
      <div className="p-5 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#15231f]" />
          <span className="font-bold text-[#15231f]">Filtra calendario:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[#64716c]">Settore:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#15231f]/15 bg-white font-medium"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64716c]">Market Cap min ($B):</span>
            <input
              type="number"
              min="0"
              step="100"
              value={minMarketCap}
              onChange={(e) => setMinMarketCap(parseFloat(e.target.value) || 0)}
              className="w-24 px-2.5 py-1 rounded-lg border border-[#15231f]/15 mono-num"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-[#15231f]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Società</th>
                <th className="py-3 px-4">Data Release</th>
                <th className="py-3 px-4">Sessione</th>
                <th className="py-3 px-4">Stima EPS</th>
                <th className="py-3 px-4">Stima Ricavi</th>
                <th className="py-3 px-4">Market Cap</th>
                <th className="py-3 px-4">Settore</th>
                <th className="py-3 px-4">Esito / Sorpresa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15231f]/5">
              {filtered.map((item) => (
                <tr key={item.ticker} className="hover:bg-[#f7f5ef]/50 transition-colors">
                  <td className="py-3 px-4 font-bold mono-num text-[#15231f]">{item.ticker}</td>
                  <td className="py-3 px-4 font-semibold text-[#15231f]">{item.company}</td>
                  <td className="py-3 px-4 mono-num text-[#64716c]">{item.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.time === 'AMC'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.time === 'AMC' ? 'Post-Market (AMC)' : 'Pre-Market (BMO)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 mono-num font-semibold">${item.epsEstimate.toFixed(2)}</td>
                  <td className="py-3 px-4 mono-num">{item.revenueEstimate}</td>
                  <td className="py-3 px-4 mono-num font-medium">${item.marketCap}B</td>
                  <td className="py-3 px-4 text-[#64716c]">{item.sector}</td>
                  <td className="py-3 px-4">
                    {item.surprise ? (
                      <span className="mono-num text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        +{item.surprise.toFixed(1)}% beat
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#64716c] italic">In attesa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
