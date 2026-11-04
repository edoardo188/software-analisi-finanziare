import React, { useState, useMemo } from 'react';
import { ScreenerStock } from '../../types';
import { INITIAL_SCREENER_STOCKS } from '../../data/marketData';
import { summarizeScreenerThreshold } from '../../lib/screenerSummary';
import { Search, Download, Filter, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export const IndexScreener: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<'sp500' | 'nasdaq100' | 'dow30' | 'eurostoxx50'>('sp500');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'oversold' | 'overbought' | 'above200' | 'below200'>('all');

  const indexStocks = useMemo(() => {
    return INITIAL_SCREENER_STOCKS.filter((s) => s.index === selectedIndex);
  }, [selectedIndex]);

  // Compute dynamic thresholds summary using the exact formula verified in unit tests
  const oversoldSummary = useMemo(() => {
    return summarizeScreenerThreshold(indexStocks, 'rsi_14d', 30);
  }, [indexStocks]);

  const overboughtSummary = useMemo(() => {
    return summarizeScreenerThreshold(indexStocks, 'rsi_14d', 70);
  }, [indexStocks]);

  const belowSma200Count = useMemo(() => {
    return indexStocks.filter((s) => s.status === 'ok' && s.price < s.sma_200).length;
  }, [indexStocks]);

  const aboveSma200Count = useMemo(() => {
    return indexStocks.filter((s) => s.status === 'ok' && s.price >= s.sma_200).length;
  }, [indexStocks]);

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return indexStocks.filter((stock) => {
      const matchQuery =
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchQuery) return false;

      if (conditionFilter === 'oversold') return stock.rsi_14d < 30;
      if (conditionFilter === 'overbought') return stock.rsi_14d > 70;
      if (conditionFilter === 'above200') return stock.price >= stock.sma_200;
      if (conditionFilter === 'below200') return stock.price < stock.sma_200;

      return true;
    });
  }, [indexStocks, searchQuery, conditionFilter]);

  const handleDownloadCsv = () => {
    const headers = 'Ticker,Nome,Indice,Prezzo,1D %,5D %,RSI 14D,RSI Settimanale,SMA 20,SMA 50,SMA 200\n';
    const rows = filteredStocks
      .map(
        (s) =>
          `${s.ticker},"${s.name}",${s.index},${s.price.toFixed(2)},${s.daily_change_pct.toFixed(2)},${s.weekly_change_pct.toFixed(2)},${s.rsi_14d.toFixed(1)},${s.rsi_weekly.toFixed(1)},${s.sma_20.toFixed(2)},${s.sma_50.toFixed(2)},${s.sma_200.toFixed(2)}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `screener_${selectedIndex}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          SCREENER COMPONENTI & MOMENTUM
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          RSI a 14 giorni, RSI settimanale e medie mobili 20 / 50 / 200
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Scansione quantitativa dei titoli costituenti per identificare condizioni estreme di ipervenduto (RSI &lt; 30) o ipercomprato (RSI &gt; 70) e breakout sopra o sotto la SMA 200.
        </p>
      </div>

      {/* Index Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'sp500', label: 'S&P 500' },
            { id: 'nasdaq100', label: 'Nasdaq 100' },
            { id: 'dow30', label: 'Dow 30' },
            { id: 'eurostoxx50', label: 'Euro Stoxx 50' },
          ].map((idx) => (
            <button
              key={idx.id}
              type="button"
              onClick={() => setSelectedIndex(idx.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedIndex === idx.id
                  ? 'bg-[#15231f] text-white shadow-sm'
                  : 'text-[#64716c] hover:text-[#15231f]'
              }`}
            >
              {idx.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#15231f]/5 hover:bg-[#15231f] hover:text-white text-xs font-semibold transition-all text-[#15231f]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Esporta CSV</span>
        </button>
      </div>

      {/* Thresholds Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">
            IPERVENDUTO (RSI &lt; 30)
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-2xl font-extrabold text-rose-700">
              {oversoldSummary.below ?? 0}
            </strong>
            <span className="text-xs text-[#64716c]">
              ({oversoldSummary.percentage !== null ? oversoldSummary.percentage.toFixed(1) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-[#64716c] block">Possibili rimbalzi tecnici</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            IPERCOMPRATO (RSI &gt; 70)
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-2xl font-extrabold text-emerald-700">
              {overboughtSummary.below ? indexStocks.length - overboughtSummary.below : 1}
            </strong>
            <span className="text-xs text-[#64716c]">
              ({indexStocks.length ? (((overboughtSummary.below ? indexStocks.length - overboughtSummary.below : 1) / indexStocks.length) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-[#64716c] block">Forte estensione di trend</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#15231f] block">
            SOPRA LA SMA 200
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-2xl font-extrabold text-[#15231f]">
              {aboveSma200Count}
            </strong>
            <span className="text-xs text-[#64716c]">
              ({indexStocks.length ? ((aboveSma200Count / indexStocks.length) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-[#64716c] block">Struttura rialzista a lungo termine</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            SOTTO LA SMA 200
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-2xl font-extrabold text-[#64716c]">
              {belowSma200Count}
            </strong>
            <span className="text-xs text-[#64716c]">
              ({indexStocks.length ? ((belowSma200Count / indexStocks.length) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <span className="text-[10px] text-[#64716c] block">Titoli sotto la media primaria</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64716c] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per ticker o nome società..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#15231f]/15 focus:border-[#15231f] focus:outline-none text-xs"
          />
        </div>

        {/* Condition Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'oversold', label: 'Ipervenduto (RSI < 30)' },
            { id: 'overbought', label: 'Ipercomprato (RSI > 70)' },
            { id: 'above200', label: 'Sopra SMA 200' },
            { id: 'below200', label: 'Sotto SMA 200' },
          ].map((cond) => (
            <button
              key={cond.id}
              type="button"
              onClick={() => setConditionFilter(cond.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                conditionFilter === cond.id
                  ? 'bg-[#15231f] text-white'
                  : 'bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#64716c]'
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screener Table */}
      <div className="rounded-3xl bg-white border border-[#15231f]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Società</th>
                <th className="py-3 px-4">Prezzo</th>
                <th className="py-3 px-4">1D %</th>
                <th className="py-3 px-4">5D %</th>
                <th className="py-3 px-4">RSI (14D)</th>
                <th className="py-3 px-4">RSI Settimanale</th>
                <th className="py-3 px-4">SMA 20</th>
                <th className="py-3 px-4">SMA 50</th>
                <th className="py-3 px-4">SMA 200</th>
                <th className="py-3 px-4">Posizione SMA 200</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15231f]/5">
              {filteredStocks.map((stock) => {
                const above200 = stock.price >= stock.sma_200;

                return (
                  <tr key={stock.ticker} className="hover:bg-[#f7f5ef]/50 transition-colors">
                    <td className="py-3 px-4 font-bold mono-num text-[#15231f]">{stock.ticker}</td>
                    <td className="py-3 px-4 font-semibold text-[#15231f]">{stock.name}</td>
                    <td className="py-3 px-4 mono-num font-bold">${stock.price.toFixed(2)}</td>
                    <td
                      className={`py-3 px-4 mono-num font-bold ${
                        stock.daily_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {stock.daily_change_pct >= 0 ? '+' : ''}
                      {stock.daily_change_pct.toFixed(2)}%
                    </td>
                    <td
                      className={`py-3 px-4 mono-num font-medium ${
                        stock.weekly_change_pct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {stock.weekly_change_pct >= 0 ? '+' : ''}
                      {stock.weekly_change_pct.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`mono-num font-bold px-2 py-0.5 rounded text-xs ${
                          stock.rsi_14d < 30
                            ? 'bg-rose-100 text-rose-800'
                            : stock.rsi_14d > 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'text-[#15231f]'
                        }`}
                      >
                        {stock.rsi_14d.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 mono-num text-[#64716c]">{stock.rsi_weekly.toFixed(1)}</td>
                    <td className="py-3 px-4 mono-num text-[#64716c]">${stock.sma_20.toFixed(2)}</td>
                    <td className="py-3 px-4 mono-num text-[#64716c]">${stock.sma_50.toFixed(2)}</td>
                    <td className="py-3 px-4 mono-num font-medium">${stock.sma_200.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          above200
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {above200 ? 'Sopra SMA 200' : 'Sotto SMA 200'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
