import React from 'react';
import { TrendingUp, TrendingDown, Minus, Shield, Compass } from 'lucide-react';

interface IndexBiasItem {
  name: string;
  ticker: string;
  price: number;
  bias: 'Rialzista' | 'Neutrale-Rialzista' | 'Neutrale' | 'Ribassista';
  momentumScore: number; // 0..100
  rsi14d: number;
  trendSma: string;
  support: number;
  resistance: number;
  summary: string;
}

const INDICES_BIAS: IndexBiasItem[] = [
  {
    name: 'S&P 500',
    ticker: '^GSPC',
    price: 6051.85,
    bias: 'Rialzista',
    momentumScore: 82,
    rsi14d: 64.2,
    trendSma: 'Sopra SMA 20, 50 e 200',
    support: 5950,
    resistance: 6120,
    summary: 'Trend primario solido con continuazione sui massimi e compressione dei drawdown intraday.',
  },
  {
    name: 'Nasdaq 100',
    ticker: '^NDX',
    price: 21462.4,
    bias: 'Rialzista',
    momentumScore: 86,
    rsi14d: 66.8,
    trendSma: 'Sopra SMA 20, 50 e 200',
    support: 21000,
    resistance: 21800,
    summary: 'Forte espansione trainata dai semiconduttori e dall\'infrastruttura software per data center.',
  },
  {
    name: 'Russell 2000',
    ticker: '^RUT',
    price: 2314.15,
    bias: 'Neutrale',
    momentumScore: 52,
    rsi14d: 48.5,
    trendSma: 'Sotto SMA 20, sopra SMA 200',
    support: 2240,
    resistance: 2380,
    summary: 'Fase di consolidamento laterale; le small cap attendono tagli dei tassi più aggressivi.',
  },
  {
    name: 'Euro Stoxx 50',
    ticker: '^STOXX50E',
    price: 5082.9,
    bias: 'Neutrale-Rialzista',
    momentumScore: 68,
    rsi14d: 56.4,
    trendSma: 'Sopra SMA 50 e 200',
    support: 4980,
    resistance: 5160,
    summary: 'Resilienza sostenuta dai titoli finanziari e dal lusso in rimbalzo tecnico.',
  },
  {
    name: 'DAX 40',
    ticker: '^GDAXI',
    price: 22465.1,
    bias: 'Rialzista',
    momentumScore: 78,
    rsi14d: 62.1,
    trendSma: 'Sopra SMA 20, 50 e 200',
    support: 22000,
    resistance: 22800,
    summary: 'Massimi storici rinnovati con traino di software industriale e multinazionali esportatrici.',
  },
  {
    name: 'Nikkei 225',
    ticker: '^N225',
    price: 38920.0,
    bias: 'Neutrale-Rialzista',
    momentumScore: 65,
    rsi14d: 54.8,
    trendSma: 'Sopra SMA 50 e 200',
    support: 38000,
    resistance: 39800,
    summary: 'Supportato dalla debolezza dello yen e dal ritorno degli afflussi istituzionali esteri.',
  },
];

export const IndexBias: React.FC = () => {
  const getBiasBadge = (bias: IndexBiasItem['bias']) => {
    switch (bias) {
      case 'Rialzista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" /> Rialzista
          </span>
        );
      case 'Neutrale-Rialzista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3.5 h-3.5" /> Neutrale-Rialzista
          </span>
        );
      case 'Neutrale':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Minus className="w-3.5 h-3.5" /> Neutrale
          </span>
        );
      case 'Ribassista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <TrendingDown className="w-3.5 h-3.5" /> Ribassista
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          POLARITÀ E RESISTENZE
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Index Technical Bias & Trend Structure
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Quadro sintetico di orientamento direzionale, posizionamento delle medie mobili e livelli volumetrici chiave sui sei benchmark azionari globali.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INDICES_BIAS.map((idx) => (
          <div
            key={idx.ticker}
            className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="mono-num text-[10px] text-[#64716c] font-medium block">
                    {idx.ticker}
                  </span>
                  <h3 className="serif-brand font-bold text-base text-[#15231f]">{idx.name}</h3>
                </div>
                {getBiasBadge(idx.bias)}
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="mono-num text-xl font-extrabold text-[#15231f]">
                  {idx.price.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-medium text-[#64716c]">
                  Momentum: <strong className="mono-num text-[#15231f]">{idx.momentumScore}/100</strong>
                </span>
              </div>

              <p className="text-xs text-[#64716c] leading-relaxed">{idx.summary}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#15231f]/5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64716c]">RSI (14 giorni)</span>
                <strong className="mono-num text-[#15231f]">{idx.rsi14d.toFixed(1)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64716c]">Struttura Medie</span>
                <span className="text-[11px] font-medium text-[#15231f]">{idx.trendSma}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#64716c]">Supporto / Resistenza</span>
                <strong className="mono-num text-[#15231f]">
                  {idx.support.toLocaleString()} / {idx.resistance.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
