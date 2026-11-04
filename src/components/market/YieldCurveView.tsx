import React from 'react';
import { INITIAL_YIELD_CURVE, INITIAL_SPREAD_HISTORY } from '../../data/marketData';
import { Download, TrendingUp, Activity } from 'lucide-react';

export const YieldCurveView: React.FC = () => {
  const curve = INITIAL_YIELD_CURVE;
  const spreadHistory = INITIAL_SPREAD_HISTORY;

  // 10Y - 2Y current spread
  const y10 = curve.find((c) => c.maturity === '10Y')?.currentYield ?? 4.28;
  const y2 = curve.find((c) => c.maturity === '2Y')?.currentYield ?? 4.18;
  const current10_2Spread = Math.round((y10 - y2) * 100);

  // SVG Chart points calculation for Yield Curve (Maturities on X, Yields on Y)
  // X range: 0..100%, Y range: 3.5%..5.8%
  const minY = 3.5;
  const maxY = 5.8;
  const toY = (val: number) => 180 - ((val - minY) / (maxY - minY)) * 150;
  const toX = (idx: number) => 40 + (idx / (curve.length - 1)) * 520;

  const currentPoints = curve.map((c, i) => `${toX(i)},${toY(c.currentYield)}`).join(' ');
  const monthAgoPoints = curve.map((c, i) => `${toX(i)},${toY(c.monthAgoYield)}`).join(' ');
  const yearAgoPoints = curve.map((c, i) => `${toX(i)},${toY(c.yearAgoYield)}`).join(' ');

  const handleDownloadCsv = () => {
    const headers = 'Maturità,Rendimento Attuale %,Un Mese Fa %,Un Anno Fa %\n';
    const rows = curve
      .map(
        (c) =>
          `${c.maturity},${c.currentYield.toFixed(2)},${c.monthAgoYield.toFixed(2)},${c.yearAgoYield.toFixed(2)}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'us_treasury_yield_curve.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
        <span className="text-[10px] font-bold tracking-widest text-[#64716c] uppercase">
          STRUTTURA DEI TASSI D'INTERESSE
        </span>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Curva dei Rendimenti USA & Differenziali di Spread
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Evoluzione della yield curve dei Treasury statunitensi da 1 mese a 30 anni e tracking storico della disinversione dello spread decennale/biennale.
        </p>
      </div>

      {/* Metric Cards for Spreads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            SPREAD USA 10Y – 2Y
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-3xl font-extrabold text-[#15231f]">
              {current10_2Spread >= 0 ? '+' : ''}{current10_2Spread} pb
            </strong>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Curva positiva
            </span>
          </div>
          <p className="text-xs text-[#64716c] pt-1">
            Uscita dall'inversione storica: 10Y al 4.28% vs 2Y al 4.18%.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            SPREAD BTP – BUND 10Y
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-3xl font-extrabold text-[#15231f]">
              +118 pb
            </strong>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Stabile
            </span>
          </div>
          <p className="text-xs text-[#64716c] pt-1">
            BTP decennale al 3.52% vs Bund tedesco decennale al 2.34%.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            SPREAD OAT – BUND 10Y
          </span>
          <div className="flex items-baseline gap-2">
            <strong className="mono-num text-3xl font-extrabold text-[#15231f]">
              +74 pb
            </strong>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Moderata tensione
            </span>
          </div>
          <p className="text-xs text-[#64716c] pt-1">
            OAT francese decennale al 3.08% vs Bund decennale al 2.34%.
          </p>
        </div>
      </div>

      {/* Interactive Yield Curve Chart */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#15231f]/5">
          <div>
            <h3 className="serif-brand font-bold text-base text-[#15231f]">
              Confronto Temporale Curva Treasury USA
            </h3>
            <div className="flex items-center gap-4 text-xs mt-1">
              <span className="flex items-center gap-1.5 font-semibold text-[#14785d]">
                <span className="w-3 h-1 bg-[#14785d] rounded-full inline-block"></span> Oggi ({y10.toFixed(2)}% / {y2.toFixed(2)}%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#2563eb]">
                <span className="w-3 h-1 bg-[#2563eb] rounded-full inline-block"></span> 1 mese fa
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#94a3b8]">
                <span className="w-3 h-1 bg-[#94a3b8] rounded-full inline-block"></span> 1 anno fa (Invertita)
              </span>
            </div>
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

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto py-2">
          <svg className="w-full min-w-[600px] h-52" viewBox="0 0 600 200">
            {/* Grid lines */}
            {[4.0, 4.5, 5.0, 5.5].map((yVal) => (
              <g key={yVal}>
                <line
                  x1="40"
                  y1={toY(yVal)}
                  x2="560"
                  y2={toY(yVal)}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text x="10" y={toY(yVal) + 4} fontSize="9" fill="#94a3b8" fontFamily="monospace">
                  {yVal.toFixed(1)}%
                </text>
              </g>
            ))}

            {/* Year ago line */}
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={yearAgoPoints}
            />

            {/* Month ago line */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={monthAgoPoints}
            />

            {/* Current line */}
            <polyline
              fill="none"
              stroke="#14785d"
              strokeWidth="3"
              points={currentPoints}
            />

            {/* Data points */}
            {curve.map((c, i) => (
              <g key={c.maturity}>
                <circle cx={toX(i)} cy={toY(c.currentYield)} r="4" fill="#14785d" />
                <text
                  x={toX(i)}
                  y="196"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#15231f"
                >
                  {c.maturity}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
