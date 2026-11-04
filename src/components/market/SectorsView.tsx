import React, { useState } from 'react';
import { SectorItem } from '../../types';
import { INITIAL_SECTORS } from '../../data/marketData';
import { ArrowUpDown, Award, AlertCircle } from 'lucide-react';

export const SectorsView: React.FC = () => {
  const [sectors, setSectors] = useState<SectorItem[]>(INITIAL_SECTORS);
  const [sortKey, setSortKey] = useState<keyof SectorItem>('daily_change_pct');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (key: keyof SectorItem) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sorted = [...sectors].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const leader = [...sectors].sort((a, b) => b.daily_change_pct - a.daily_change_pct)[0];
  const laggard = [...sectors].sort((a, b) => a.daily_change_pct - b.daily_change_pct)[0];
  const positiveSectorsCount = sectors.filter((s) => s.daily_change_pct > 0).length;
  const breadthPct = (positiveSectorsCount / sectors.length) * 100;

  const getStageBadge = (stage: SectorItem['stage']) => {
    switch (stage) {
      case 'Leading':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Leading (Guida)</span>;
      case 'Improving':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Improving (Migliora)</span>;
      case 'Weakening':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Weakening (Rallenta)</span>;
      case 'Lagging':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Lagging (Ritardo)</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          ROTAZIONE SETTORIALE S&P 500
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Performance e forza relativa degli 11 ETF di settore
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Monitoraggio continuo dei flussi di capitale tra titoli ciclici (tech, finanziari, discrezionali) e difensivi (sanità, staples, utility).
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            AMPIEZZA SETTORIALE GIORNALIERA
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-2xl font-extrabold text-[#15231f]">
              {breadthPct.toFixed(0)}%
            </strong>
            <span className="text-xs text-[#64716c]">
              ({positiveSectorsCount} su {sectors.length} settori in rialzo)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${breadthPct}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-emerald-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase">
            <Award className="w-4 h-4" /> Settore Leader oggi
          </div>
          <strong className="text-base font-bold text-[#15231f] block">
            {leader.name} ({leader.symbol})
          </strong>
          <span className="mono-num text-sm font-bold text-emerald-700">
            +{leader.daily_change_pct.toFixed(2)}% oggi · +{leader.ytd_change_pct.toFixed(1)}% YTD
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-200/80 shadow-sm space-y-2">
          <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase">
            <AlertCircle className="w-4 h-4" /> Settore Laggard oggi
          </div>
          <strong className="text-base font-bold text-[#15231f] block">
            {laggard.name} ({laggard.symbol})
          </strong>
          <span className="mono-num text-sm font-bold text-rose-700">
            {laggard.daily_change_pct.toFixed(2)}% oggi · +{laggard.ytd_change_pct.toFixed(1)}% YTD
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-[#15231f]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Simbolo</th>
                <th className="py-3 px-4">Macrosettore</th>
                <th className="py-3 px-4">Prezzo</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#15231f]"
                  onClick={() => handleSort('daily_change_pct')}
                >
                  <div className="flex items-center gap-1">
                    <span>1 Giorno</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#15231f]"
                  onClick={() => handleSort('weekly_change_pct')}
                >
                  <div className="flex items-center gap-1">
                    <span>1 Settimana</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#15231f]"
                  onClick={() => handleSort('monthly_change_pct')}
                >
                  <div className="flex items-center gap-1">
                    <span>1 Mese</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#15231f]"
                  onClick={() => handleSort('ytd_change_pct')}
                >
                  <div className="flex items-center gap-1">
                    <span>YTD</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Fase di rotazione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15231f]/5">
              {sorted.map((item) => (
                <tr key={item.symbol} className="hover:bg-[#f7f5ef]/50 transition-colors">
                  <td className="py-3 px-4 font-bold mono-num text-[#15231f]">{item.symbol}</td>
                  <td className="py-3 px-4 font-semibold text-[#15231f]">{item.name}</td>
                  <td className="py-3 px-4 mono-num">${item.price.toFixed(2)}</td>
                  <td
                    className={`py-3 px-4 mono-num font-bold ${
                      item.daily_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.daily_change_pct >= 0 ? '+' : ''}
                    {item.daily_change_pct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-medium ${
                      item.weekly_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.weekly_change_pct >= 0 ? '+' : ''}
                    {item.weekly_change_pct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-medium ${
                      item.monthly_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.monthly_change_pct >= 0 ? '+' : ''}
                    {item.monthly_change_pct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-bold ${
                      item.ytd_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {item.ytd_change_pct >= 0 ? '+' : ''}
                    {item.ytd_change_pct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">{getStageBadge(item.stage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
