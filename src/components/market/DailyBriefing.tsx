import React, { useState } from 'react';
import { MarketItem, RegimeInfo, SentimentReport } from '../../types';
import { Sparkles, Info, ArrowUpRight, ArrowDownRight, Compass, ShieldCheck } from 'lucide-react';

interface DailyBriefingProps {
  markets: MarketItem[];
  regime: RegimeInfo;
  sentiment: SentimentReport;
  onUpdateManualSentiment: (score: number) => void;
  lastUpdated: string;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  markets,
  regime,
  sentiment,
  onUpdateManualSentiment,
  lastUpdated,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Tutti');
  const [manualInput, setManualInput] = useState<string>('');
  const [savedManualToast, setSavedManualToast] = useState<boolean>(false);

  // Fear & Greed color helper
  const getSentimentTone = (score: number) => {
    if (score <= 25) return { color: '#b74a3e', label: 'Estrema Paura' };
    if (score <= 45) return { color: '#d88848', label: 'Paura' };
    if (score <= 55) return { color: '#b09a3f', label: 'Neutrale' };
    if (score <= 75) return { color: '#69a783', label: 'Avidità' };
    return { color: '#14785d', label: 'Estrema Avidità' };
  };

  const currentSentiment = sentiment.manualScore ?? sentiment.score;
  const sentimentMeta = getSentimentTone(currentSentiment);

  const visibleMarkets = selectedGroup === 'Tutti'
    ? markets
    : markets.filter((m) => m.group === selectedGroup);

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualInput, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onUpdateManualSentiment(val);
      setSavedManualToast(true);
      setTimeout(() => setSavedManualToast(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Session Reading */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-bold tracking-widest text-[#64716c] uppercase">
            LETTURA DELLA SEDUTA · CROSS-ASSET
          </p>
          <h1 className="serif-brand text-2xl sm:text-3xl font-bold text-[#15231f] leading-snug">
            Che cosa sta raccontando<br />il mercato oggi?
          </h1>
          <p className="text-xs sm:text-sm text-[#64716c] leading-relaxed">
            Prezzi, rendimenti obbligazionari, premio al rischio e catalizzatori macro condensati in una lettura coerente.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#64716c] pt-2 md:pt-0 border-t md:border-t-0 border-[#15231f]/5">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64716c]">Ultimo aggiornamento</span>
            <strong className="mono-num text-sm text-[#15231f]">{lastUpdated}</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64716c]">Copertura dati</span>
            <strong className="mono-num text-sm text-[#15231f]">17 asset · Real-time</strong>
          </div>
        </div>
      </section>

      {/* Regime Probabile & Scenari Prossima Seduta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Regime Panel */}
        <article className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
              REGIME PROBABILE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60">
              Confidenza {regime.confidence}/100
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
              </span>
              <h2 className="serif-brand text-lg font-bold text-[#15231f]">{regime.name}</h2>
            </div>
            <p className="text-xs text-[#64716c] leading-relaxed">{regime.explanation}</p>
          </div>

          {/* Evidence tags */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] uppercase font-semibold text-[#64716c]">Evidenze di mercato:</span>
            <div className="flex flex-wrap gap-1.5">
              {regime.evidence.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#f7f5ef] border border-[#15231f]/10 text-[11px] font-medium text-[#15231f]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Scenari Prossima Seduta */}
        <article className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
              SCENARI PROSSIMA SEDUTA
            </span>
            <span className="text-[10px] text-[#64716c] font-medium">Pesi euristici</span>
          </div>

          <div className="space-y-2.5">
            {regime.scenarios.map((sc, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#f7f5ef]/70 border border-[#15231f]/5 hover:border-[#15231f]/15 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mono-num text-xs font-bold text-[#64716c] mt-0.5">0{index + 1}</span>
                  <div>
                    <strong className="text-xs font-bold text-[#15231f] block">{sc.name}</strong>
                    <p className="text-[11px] text-[#64716c] mt-0.5">{sc.condition}</p>
                  </div>
                </div>
                <span className="mono-num text-xs font-bold px-2 py-0.5 rounded bg-white text-[#15231f] border border-[#15231f]/10 shadow-xs flex-shrink-0">
                  {sc.weight}%
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Fear & Greed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
              SENTIMENT MULTIFATTORE
            </p>
            <h2 className="serif-brand text-lg font-bold text-[#15231f]">
              Fear & Greed interno (7 componenti)
            </h2>
          </div>
          <p className="hidden md:block text-xs text-[#64716c] max-w-md text-right">
            Sette componenti equiponderate con confronto esterno separato dal segnale proprietario.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Meter */}
          <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-40 h-24 flex items-end justify-center">
                {/* Gauge arc SVG */}
                <svg className="w-40 h-20" viewBox="0 0 160 80">
                  <path
                    d="M 10 75 A 70 70 0 0 1 150 75"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 75 A 70 70 0 0 1 150 75"
                    fill="none"
                    stroke={sentimentMeta.color}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray="220"
                    strokeDashoffset={220 - (220 * currentSentiment) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute bottom-0 text-center">
                  <span className="mono-num text-3xl font-extrabold text-[#15231f]">
                    {currentSentiment}
                  </span>
                  <span className="text-xs text-[#64716c]">/100</span>
                </div>
              </div>

              <span
                className="mt-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: sentimentMeta.color }}
              >
                {sentimentMeta.label}
              </span>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#15231f]/5 text-center sm:text-left">
              <p className="text-xs text-[#15231f] font-medium leading-relaxed">{sentiment.drivers}</p>
              <small className="text-[10px] text-[#64716c] block">{sentiment.methodology}</small>
            </div>
          </div>

          {/* 7 Components List */}
          <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
                LE SETTE COMPONENTI
              </span>
              <span className="text-[10px] text-[#64716c] font-medium">Equiponderate (14.3%)</span>
            </div>

            <div className="space-y-2.5 max-h-[17rem] overflow-y-auto pr-1">
              {sentiment.components.map((comp, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-[#f7f5ef]/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-[11px] text-[#15231f]">{comp.name}</strong>
                    <span className="mono-num font-bold text-[11px] text-[#15231f]">{comp.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${comp.score}%`,
                        backgroundColor: getSentimentTone(comp.score).color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#64716c]">
                    <span>{comp.value}</span>
                    {comp.proxyNote && <span className="italic text-[9px]">Proxy</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External CNN Comparison & Manual Override */}
          <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
                  CONFRONTO ESTERNO
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                  {sentiment.cnnStatus}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f7f5ef] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#64716c] block">
                    CNN Fear & Greed ufficiale
                  </span>
                  <strong className="mono-num text-xl font-bold text-[#15231f]">
                    {sentiment.cnnFearGreed ?? 'Non disponibile'}
                  </strong>
                </div>
                <div className="text-right text-[10px] text-[#64716c]">
                  <span>Scostamento interno:</span>
                  <strong className="block mono-num font-bold text-[#15231f]">
                    {sentiment.cnnFearGreed !== null
                      ? `${sentiment.score - (sentiment.cnnFearGreed ?? 0) >= 0 ? '+' : ''}${
                          sentiment.score - (sentiment.cnnFearGreed ?? 0)
                        } pt`
                      : 'N/D'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Manual Override Form */}
            <form onSubmit={handleSaveManual} className="p-3.5 rounded-2xl bg-[#f7f5ef]/60 border border-[#15231f]/5 space-y-2 text-xs">
              <label htmlFor="manualInput" className="font-semibold text-[#15231f] block text-[11px]">
                Valore esterno manuale
              </label>
              <div className="flex gap-2">
                <input
                  id="manualInput"
                  type="number"
                  min="0"
                  max="100"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="0–100"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#15231f]/15 mono-num text-xs bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#15231f] text-white font-semibold text-xs hover:bg-[#20342e] transition-colors"
                >
                  Salva
                </button>
              </div>
              <small className="text-[10px] text-[#64716c] block leading-tight">
                Utilizzato quando l'accesso automatico a CNN è bloccato. Salvato localmente.
              </small>
            </form>
          </div>
        </div>
      </section>

      {/* Cross-Asset Market Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
              QUADRO ASSET GLOBALI
            </p>
            <h2 className="serif-brand text-lg font-bold text-[#15231f]">
              Prezzi, variazioni e z-score
            </h2>
          </div>

          {/* Group Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['Tutti', 'Indici', 'Valute', 'Materie prime', 'Rischio', 'Crypto'].map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedGroup === grp
                    ? 'bg-[#15231f] text-white shadow-xs'
                    : 'bg-white border border-[#15231f]/10 text-[#64716c] hover:text-[#15231f]'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleMarkets.map((item) => {
            const isNegative =
              item.kind === 'yield'
                ? (item.change_bps ?? 0) < 0
                : (item.change_pct ?? 0) < 0;

            const changeText =
              item.kind === 'yield'
                ? `${(item.change_bps ?? 0) >= 0 ? '+' : ''}${(item.change_bps ?? 0).toFixed(1)} pb`
                : `${(item.change_pct ?? 0) >= 0 ? '+' : ''}${(item.change_pct ?? 0).toFixed(2)}%`;

            // Sparkline points SVG
            const points = item.sparkline
              .map((val, idx) => {
                const x = (idx / (item.sparkline.length - 1)) * 100;
                const y = 35 - val * 30;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ');

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#64716c] block">
                      {item.group}
                    </span>
                    <strong className="text-sm font-bold text-[#15231f]">{item.name}</strong>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold mono-num ${
                      isNegative
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isNegative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {changeText}
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="mono-num text-xl font-extrabold text-[#15231f]">
                    {item.value.toLocaleString('it-IT', {
                      maximumFractionDigits: item.value < 10 ? 4 : 2,
                    })}
                  </span>
                  {item.kind === 'yield' && <span className="text-xs text-[#64716c]">%</span>}
                </div>

                {/* Sparkline SVG */}
                <div className="w-full h-8 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke={isNegative ? '#b74a3e' : '#14785d'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#64716c] pt-2 border-t border-[#15231f]/5">
                  <span className="mono-num">{item.date}</span>
                  <span className="mono-num font-semibold">z-score {item.zscore.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🇺🇸</span>
            <h3 className="serif-brand font-bold text-sm text-[#15231f]">Focus Macro USA</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#64716c] list-disc list-inside leading-relaxed">
            <li>Il settore tecnologico large-cap guida il rialzo spinto dai capex su infrastrutture AI.</li>
            <li>I rendimenti decennali Treasury oscillano intorno al 4.28% in attesa dei prossimi dati su salari e posti vacanti.</li>
            <li>Il dollaro USA si mantiene tonico contro euro e yen senza tuttavia generare de-leveraging forzato sui mercati emergenti.</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🇪🇺</span>
            <h3 className="serif-brand font-bold text-sm text-[#15231f]">Focus Macro Europa</h3>
          </div>
          <ul className="space-y-2 text-xs text-[#64716c] list-disc list-inside leading-relaxed">
            <li>Lo spread BTP-Bund decennale si contrae a quota 118 punti base beneficiando della stabilità del debito periferico.</li>
            <li>La BCE continua a monitorare il rallentamento della manifattura tedesca con probabilità elevate di allentamento monetario graduale.</li>
            <li>I titoli bancari europei registrano margini di interesse resilienti pur in uno scenario di tassi in moderata discesa.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
