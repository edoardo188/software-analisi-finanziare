import React, { useState } from 'react';
import { CoveredWarrant, ScenarioResult } from '../../types';
import { expiryScenarios } from '../../lib/cwEngine';
import { Sliders, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface ExpiryScenariosProps {
  warrant: CoveredWarrant;
}

export const ExpiryScenarios: React.FC<ExpiryScenariosProps> = ({ warrant }) => {
  const [variationPct, setVariationPct] = useState<number>(3.0);

  const spot = warrant.spot_price;
  const strike = warrant.strike;
  const ratio = warrant.ratio;
  const purchasePrice = warrant.ask;
  const warrantType = warrant.warrant_type;

  const canCalculate =
    spot !== null &&
    strike !== null &&
    ratio !== null &&
    ratio > 0 &&
    purchasePrice !== null &&
    purchasePrice > 0;

  if (!canCalculate) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        Scenari a scadenza non disponibili: mancano prezzo sottostante, strike, ratio o prezzo ask.
      </div>
    );
  }

  const variation = variationPct / 100;
  const scenarios: ScenarioResult[] = expiryScenarios(
    spot,
    strike,
    ratio,
    purchasePrice,
    warrantType,
    [-variation, variation]
  );
  const downside = scenarios[0];
  const upside = scenarios[1];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#15231f]" />
            <h4 className="text-sm font-semibold text-[#15231f]">
              Variazione simmetrica del sottostante
            </h4>
          </div>
          <p className="text-xs text-[#64716c]">
            Il valore scelto regola simultaneamente sia lo scenario ribassista sia quello rialzista.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0.5"
            max="30.0"
            step="0.5"
            value={variationPct}
            onChange={(e) => setVariationPct(parseFloat(e.target.value))}
            className="w-44 sm:w-56 accent-[#15231f] cursor-pointer"
          />
          <span className="mono-num font-bold text-sm bg-[#15231f]/5 px-2.5 py-1 rounded-md min-w-[4rem] text-center">
            ±{variationPct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Downside card */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <h5 className="font-semibold text-sm text-[#15231f]">
                Downside −{variationPct.toFixed(1)}%
              </h5>
            </div>
            <span className="mono-num text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
              {downside.variation_pct < 0 ? '' : '+'}
              {(downside.variation_pct * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Prezzo sottostante</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {downside.underlying_price.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Valore CW a scadenza</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {downside.warrant_value.toFixed(4)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Profitto / Perdita</span>
              <strong
                className={`mono-num text-sm ${
                  downside.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {downside.pnl >= 0 ? '+' : ''}
                {downside.pnl.toFixed(4)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Rendimento %</span>
              <strong
                className={`mono-num text-sm ${
                  (downside.pnl_pct ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {downside.pnl_pct !== null
                  ? `${downside.pnl_pct >= 0 ? '+' : ''}${(downside.pnl_pct * 100).toFixed(2)}%`
                  : 'N/D'}
              </strong>
            </div>
          </div>
        </div>

        {/* Upside card */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h5 className="font-semibold text-sm text-[#15231f]">
                Upside +{variationPct.toFixed(1)}%
              </h5>
            </div>
            <span className="mono-num text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              +{(upside.variation_pct * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Prezzo sottostante</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {upside.underlying_price.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Valore CW a scadenza</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {upside.warrant_value.toFixed(4)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Profitto / Perdita</span>
              <strong
                className={`mono-num text-sm ${
                  upside.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {upside.pnl >= 0 ? '+' : ''}
                {upside.pnl.toFixed(4)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]/60">
              <span className="text-[#64716c] block mb-0.5">Rendimento %</span>
              <strong
                className={`mono-num text-sm ${
                  (upside.pnl_pct ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {upside.pnl_pct !== null
                  ? `${upside.pnl_pct >= 0 ? '+' : ''}${(upside.pnl_pct * 100).toFixed(2)}%`
                  : 'N/D'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
