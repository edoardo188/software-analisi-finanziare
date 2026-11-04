import React from 'react';
import { RefreshCw, Sparkles, CheckCircle2, TrendingUp, Compass, Download } from 'lucide-react';

interface HeaderProps {
  activeApp: 'market' | 'financial';
  setActiveApp: (app: 'market' | 'financial') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCopyChatGpt: () => void;
  copiedToast: boolean;
  freshnessText: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeApp,
  setActiveApp,
  onRefresh,
  isRefreshing,
  onCopyChatGpt,
  copiedToast,
  freshnessText,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#15231f]/10 bg-[#f7f5ef]/90 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#15231f] text-white flex items-center justify-center serif-brand font-bold text-xl shadow-md">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="serif-brand font-bold text-lg text-[#15231f] leading-tight tracking-tight">
                Market & Financial Analyzer
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#15231f]/5 text-[#64716c]">
                v0.5.0
              </span>
            </div>
            <p className="text-xs text-[#64716c] font-medium tracking-wide">
              Cross-asset daily briefing & Quantitative Covered Warrant engine
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-[#15231f]/8 p-1 rounded-xl border border-[#15231f]/10">
          <button
            type="button"
            onClick={() => setActiveApp('market')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeApp === 'market'
                ? 'bg-white text-[#15231f] shadow-sm'
                : 'text-[#64716c] hover:text-[#15231f]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Market Analyzer
          </button>
          <button
            type="button"
            onClick={() => setActiveApp('financial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeApp === 'financial'
                ? 'bg-white text-[#15231f] shadow-sm'
                : 'text-[#64716c] hover:text-[#15231f]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Financial Analyzer (CW)
          </button>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-medium text-[11px]">{freshnessText}</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#15231f]/15 hover:border-[#15231f]/30 text-[#15231f] shadow-sm hover:shadow transition-all disabled:opacity-50"
            title="Aggiorna analisi dati di mercato"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Aggiorna</span>
          </button>

          <a
            href="/api/export-source-zip"
            download="financial-analyzer-applet.zip"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#15231f]/15 hover:border-[#15231f]/30 text-[#15231f] shadow-sm hover:shadow transition-all"
            title="Scarica archivio ZIP completo del codice sorgente"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Scarica ZIP</span>
          </a>

          <button
            type="button"
            onClick={onCopyChatGpt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#15231f] text-white hover:bg-[#20342e] shadow-md hover:shadow-lg transition-all"
            title="Copia briefing per ChatGPT"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Copia per ChatGPT</span>
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15231f] text-white text-xs shadow-2xl animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Briefing copiato negli appunti! Puoi incollarlo direttamente in ChatGPT.</span>
        </div>
      )}
    </header>
  );
};
