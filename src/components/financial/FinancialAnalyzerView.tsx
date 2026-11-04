import React, { useState } from 'react';
import { IsinAnalysis } from './IsinAnalysis';
import { CwSearch } from './CwSearch';
import { TurboLongCwPutView } from './TurboLongCwPutView';
import { Search, Sparkles, Zap, Compass } from 'lucide-react';

export const FinancialAnalyzerView: React.FC = () => {
  const [subView, setSubView] = useState<'ANALIZZA ISIN' | 'CERCA CW' | 'TURBO LONG + CW PUT'>('ANALIZZA ISIN');
  const [selectedIsinForDetail, setSelectedIsinForDetail] = useState<string>('NLBNPIT3NC35');

  const handleSelectFromSearch = (isin: string) => {
    setSelectedIsinForDetail(isin);
    setSubView('ANALIZZA ISIN');
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with Streamlit gradient banner style */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Motore quantitativo Covered Warrant & Arbitraggio Asimmetrico</span>
          </div>
          <h1 className="serif-brand text-2xl sm:text-3xl font-bold tracking-tight">
            Financial Analyzer
          </h1>
          <p className="text-sm text-blue-100 max-w-2xl font-normal leading-relaxed">
            Analisi quantitativa dei Covered Warrant tramite ISIN, riconoscimento automatico dell'emittente, simulatore inverso TARGET e modulo di arbitraggio asimmetrico <strong>Turbo Long + CW Put Infraweek</strong>.
          </p>
        </div>

        {/* Ambient geometric light */}
        <div className="absolute right-[-4rem] top-[-4rem] w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Sub-view Radio Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setSubView('ANALIZZA ISIN')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            subView === 'ANALIZZA ISIN'
              ? 'bg-[#15231f] text-white shadow-sm'
              : 'text-[#64716c] hover:text-[#15231f]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>ANALIZZA ISIN</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('CERCA CW')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            subView === 'CERCA CW'
              ? 'bg-[#15231f] text-white shadow-sm'
              : 'text-[#64716c] hover:text-[#15231f]'
          }`}
        >
          <span>CERCA CW</span>
        </button>

        <button
          type="button"
          onClick={() => setSubView('TURBO LONG + CW PUT')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            subView === 'TURBO LONG + CW PUT'
              ? 'bg-[#15231f] text-white shadow-sm'
              : 'text-[#64716c] hover:text-[#15231f]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>ARBITRAGGIO & STRATEGIE COMBINATE</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 ml-0.5">
            4 Strategie
          </span>
        </button>
      </div>

      {/* Content */}
      {subView === 'ANALIZZA ISIN' && (
        <IsinAnalysis initialIsin={selectedIsinForDetail} />
      )}
      {subView === 'CERCA CW' && (
        <CwSearch onSelectForAnalysis={handleSelectFromSearch} />
      )}
      {subView === 'TURBO LONG + CW PUT' && (
        <TurboLongCwPutView />
      )}
    </div>
  );
};
