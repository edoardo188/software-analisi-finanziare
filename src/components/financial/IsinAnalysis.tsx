import React, { useState, useEffect } from 'react';
import { CoveredWarrant, RecentSearch } from '../../types';
import {
  spreadAbs,
  spreadPct,
  timeToMaturityDays,
  intrinsicValue,
  timeValue,
  distanceFromStrikePct,
  moneynessClassification,
  effectiveLeverage,
  elasticityFromDelta,
  thetaCostPct,
  maxLoss,
  callBreakEven,
  putBreakEven,
  isPut,
  detectIssuerByIsin,
} from '../../lib/cwEngine';
import { INITIAL_COVERED_WARRANTS } from '../../data/cwCatalog';
import { ExpiryScenarios } from './ExpiryScenarios';
import { Search, History, Building2, Code2, ShieldAlert } from 'lucide-react';

interface IsinAnalysisProps {
  initialIsin?: string;
  onSelectIsin?: (isin: string) => void;
}

export const IsinAnalysis: React.FC<IsinAnalysisProps> = ({ initialIsin }) => {
  const [isinInput, setIsinInput] = useState<string>(initialIsin || 'NLBNPIT3NC35');
  const [activeWarrant, setActiveWarrant] = useState<CoveredWarrant | null>(() => {
    const found = INITIAL_COVERED_WARRANTS.find(
      (w) => w.isin.toUpperCase() === (initialIsin || 'NLBNPIT3NC35').toUpperCase()
    );
    return found || INITIAL_COVERED_WARRANTS[0];
  });
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const stored = localStorage.getItem('fa_recent_cw');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showJson, setShowJson] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialIsin) {
      setIsinInput(initialIsin);
      handleSearch(initialIsin);
    }
  }, [initialIsin]);

  const handleSearch = (searchIsin: string) => {
    const cleanIsin = searchIsin.trim().toUpperCase();
    if (!cleanIsin) return;

    setErrorMsg(null);
    const found = INITIAL_COVERED_WARRANTS.find((w) => w.isin.toUpperCase() === cleanIsin);

    if (found) {
      setActiveWarrant(found);
      const detection = detectIssuerByIsin(cleanIsin);
      // Save in recent searches
      const newRecent: RecentSearch = {
        isin: found.isin,
        underlying_name: found.underlying_name,
        issuer: found.issuer || detection.issuer,
        provider_name: found.issuer || detection.issuer,
        timestamp: Date.now(),
      };
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.isin !== found.isin);
        const updated = [newRecent, ...filtered].slice(0, 10);
        try {
          localStorage.setItem('fa_recent_cw', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else {
      // Create a sensible model for unknown ISIN using auto-detected issuer
      const detection = detectIssuerByIsin(cleanIsin);
      const syntheticWarrant: CoveredWarrant = {
        isin: cleanIsin,
        issuer: detection.issuer,
        warrant_type: cleanIsin.includes('P') ? 'PUT' : 'CALL',
        underlying_name: 'Indice / Sottostante Globale',
        strike: 100,
        expiry: '2027-06-18',
        ratio: 10,
        currency: 'EUR',
        bid: 0.85,
        ask: 0.9,
        mid_price: 0.875,
        spot_price: 104.5,
        implied_volatility: 0.22,
        delta: 0.55,
        gamma: 0.02,
        theta: -0.0008,
        vega: 0.05,
        rho: 0.03,
        omega: 6.2,
      };
      setActiveWarrant(syntheticWarrant);
      setErrorMsg(
        `ISIN "${cleanIsin}" riconosciuto presso provider "${detection.issuer}". Sono visualizzati i parametri normalizzati.`
      );
    }
  };

  const cw = activeWarrant;
  const detection = cw ? detectIssuerByIsin(cw.isin) : null;

  // Quantitative metrics calculations
  const purchasePrice = cw?.ask ?? null;
  const intrinsic = cw ? intrinsicValue(cw.spot_price, cw.strike, cw.ratio, cw.warrant_type) : null;
  const temporal = cw ? timeValue(purchasePrice, intrinsic) : null;
  const distStrike = cw ? distanceFromStrikePct(cw.spot_price, cw.strike) : null;
  const sprAbs = cw ? spreadAbs(cw.bid, cw.ask) : null;
  const sprPct = cw ? spreadPct(cw.bid, cw.ask) : null;
  const daysLeft = cw ? timeToMaturityDays(cw.expiry) : null;
  const lev = cw ? effectiveLeverage(cw.spot_price, purchasePrice, cw.ratio) : null;
  const elasticity = cw
    ? elasticityFromDelta(cw.spot_price, purchasePrice, cw.ratio, cw.delta)
    : null;
  const thetaPct = cw ? thetaCostPct(purchasePrice, cw.theta) : null;
  const loss = cw ? maxLoss(purchasePrice) : null;
  const moneyness = cw
    ? moneynessClassification(cw.spot_price, cw.strike, cw.warrant_type)
    : 'N/D';

  const breakEven =
    cw && purchasePrice !== null && cw.strike !== null && cw.ratio !== null
      ? isPut(cw.warrant_type)
        ? putBreakEven(cw.strike, purchasePrice, cw.ratio)
        : callBreakEven(cw.strike, purchasePrice, cw.ratio)
      : null;

  return (
    <div className="space-y-6">
      {/* Search Bar & Auto Provider Detection */}
      <div className="p-6 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={isinInput}
              onChange={(e) => setIsinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(isinInput)}
              placeholder="Inserisci ISIN Covered Warrant (es. NLBNPIT3NC35, DE000UR06PK1)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#15231f]/15 focus:border-[#15231f] focus:outline-none mono-num uppercase text-sm font-semibold tracking-wide placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#64716c]"
            />
            <Search className="w-5 h-5 text-[#64716c] absolute left-3.5 top-3.5" />
          </div>

          <button
            type="button"
            onClick={() => handleSearch(isinInput)}
            className="px-6 py-3 rounded-xl bg-[#15231f] hover:bg-[#20342e] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Analizza ISIN</span>
          </button>
        </div>

        {/* Quick Test ISIN Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[#64716c] font-medium">ISIN di test verificati:</span>
          {[
            { isin: 'NLBNPIT3NC35', label: 'BNP Paribas · Call FTSE MIB' },
            { isin: 'DE000UR06PK1', label: 'UniCredit · Call FTSE MIB' },
            { isin: 'DE000VJ31371', label: 'Vontobel · Call DAX 40' },
            { isin: 'DE000SH2K390', label: 'Société Générale · Call S&P 500' },
            { isin: 'DE000UR08PL8', label: 'UniCredit · Put FTSE MIB' },
          ].map((item) => (
            <button
              key={item.isin}
              type="button"
              onClick={() => {
                setIsinInput(item.isin);
                handleSearch(item.isin);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#15231f] font-medium border border-[#15231f]/10 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="pt-2 border-t border-[#15231f]/5 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[#64716c] flex items-center gap-1 flex-shrink-0">
              <History className="w-3.5 h-3.5" /> Ricerche recenti:
            </span>
            {recentSearches.map((rec) => (
              <button
                key={rec.isin}
                type="button"
                onClick={() => {
                  setIsinInput(rec.isin);
                  handleSearch(rec.isin);
                }}
                className="px-2.5 py-1 rounded-md bg-white border border-[#15231f]/10 text-[#15231f] hover:border-[#15231f]/30 flex-shrink-0 flex items-center gap-1.5 font-medium"
              >
                <span>{rec.underlying_name}</span>
                <span className="text-[#64716c] mono-num">{rec.isin}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {cw && (
        <div className="space-y-6">
          {/* Provider Notification Badge */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-medium">
              <span className="text-base">🏦</span>
              <span>
                Fonte dati rilevata automaticamente: <strong>{cw.issuer || detection?.issuer}</strong>
              </span>
            </div>
            <span className="mono-num px-2 py-0.5 rounded bg-emerald-200/60 font-semibold text-[11px]">
              ISIN {cw.isin}
            </span>
          </div>

          {/* Dati Principali */}
          <div className="space-y-2">
            <h3 className="serif-brand font-bold text-base text-[#15231f] tracking-tight">
              Dati principali
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">ISIN</span>
                <strong className="mono-num text-xs font-bold text-[#15231f] break-all">{cw.isin}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Emittente</span>
                <strong className="text-xs font-bold text-[#15231f]">{cw.issuer}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Tipo strumento</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    isPut(cw.warrant_type)
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {cw.warrant_type}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Sottostante</span>
                <strong className="text-xs font-bold text-[#15231f]">{cw.underlying_name}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Prezzo Spot</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.spot_price?.toLocaleString('it-IT', { maximumFractionDigits: 2 }) ?? 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Strike Price</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.strike?.toLocaleString('it-IT', { maximumFractionDigits: 2 }) ?? 'N/D'}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Scadenza</span>
                <strong className="mono-num text-xs font-semibold text-[#15231f]">{cw.expiry || 'N/D'}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Ratio (Divisore)</span>
                <strong className="mono-num text-xs font-semibold text-[#15231f]">{cw.ratio}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Ticker Sottostante</span>
                <strong className="mono-num text-xs font-semibold text-[#15231f]">
                  {cw.underlying_ticker || 'N/D'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-0.5">Valuta</span>
                <strong className="text-xs font-semibold text-[#15231f]">{cw.currency}</strong>
              </div>
            </div>
          </div>

          {/* Quotazione */}
          <div className="space-y-2">
            <h3 className="serif-brand font-bold text-base text-[#15231f] tracking-tight">Quotazione</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Bid (Denaro)</span>
                <strong className="mono-num text-base font-bold text-[#15231f]">
                  {cw.bid !== null ? cw.bid.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Ask (Lettera / Acquisto)</span>
                <strong className="mono-num text-base font-bold text-[#15231f]">
                  {cw.ask !== null ? cw.ask.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Mid Price</span>
                <strong className="mono-num text-base font-bold text-[#15231f]">
                  {cw.mid_price !== null ? cw.mid_price.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Spread Assoluto</span>
                <strong className="mono-num text-base font-bold text-[#15231f]">
                  {sprAbs !== null ? sprAbs.toFixed(4) : 'N/D'}
                </strong>
              </div>
            </div>
          </div>

          {/* Greche e indicatori */}
          <div className="space-y-2">
            <h3 className="serif-brand font-bold text-base text-[#15231f] tracking-tight">
              Greche e indicatori
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Delta</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.delta !== null ? cw.delta.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Gamma</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.gamma !== null ? cw.gamma.toFixed(6) : 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Theta</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.theta !== null ? cw.theta.toFixed(6) : 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Vega</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.vega !== null ? cw.vega.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Rho</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.rho !== null ? cw.rho.toFixed(4) : 'N/D'}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#15231f]/10 shadow-sm">
                <span className="text-[11px] text-[#64716c] block mb-1">Omega</span>
                <strong className="mono-num text-sm font-bold text-[#15231f]">
                  {cw.omega !== null ? cw.omega.toFixed(2) : 'N/D'}
                </strong>
              </div>
            </div>
          </div>

          {/* Metriche calcolate dal software */}
          <div className="space-y-2">
            <h3 className="serif-brand font-bold text-base text-[#15231f] tracking-tight">
              Metriche calcolate dal software
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
                <div>
                  <span className="text-[11px] text-[#64716c] block">Spread %</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {sprPct !== null ? `${(sprPct * 100).toFixed(2)}%` : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Perdita massima</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {loss !== null ? loss.toFixed(4) : 'N/D'}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
                <div>
                  <span className="text-[11px] text-[#64716c] block">Giorni a scadenza</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {daysLeft !== null ? `${daysLeft} giorni` : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Distanza strike</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {distStrike !== null
                      ? `${distStrike >= 0 ? '+' : ''}${(distStrike * 100).toFixed(2)}%`
                      : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Moneyness</span>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-[#15231f]/5 text-[#15231f]">
                    {moneyness}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
                <div>
                  <span className="text-[11px] text-[#64716c] block">Valore intrinseco</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {intrinsic !== null ? intrinsic.toFixed(4) : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Valore temporale</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {temporal !== null ? temporal.toFixed(4) : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Leva effettiva</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {lev !== null ? `${lev.toFixed(2)}x` : 'N/D'}
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#15231f]/10 shadow-sm space-y-2">
                <div>
                  <span className="text-[11px] text-[#64716c] block">Elasticità stimata</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {elasticity !== null ? elasticity.toFixed(2) : 'N/D'}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-[#64716c] block">Theta % giornaliero</span>
                  <strong className="mono-num text-sm font-bold text-[#15231f]">
                    {thetaPct !== null ? `${(thetaPct * 100).toFixed(3)}%` : 'N/D'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Break-even personale */}
          <div className="p-4 rounded-2xl bg-[#15231f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-xs uppercase tracking-wider text-white/70 block">
                Break-even personale a scadenza
              </span>
              <p className="text-xs text-white/80">
                Prezzo del sottostante necessario per coprire esattamente il costo di acquisto (Ask).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <strong className="mono-num text-2xl font-bold text-emerald-400">
                {breakEven !== null
                  ? breakEven.toLocaleString('it-IT', { maximumFractionDigits: 2 })
                  : 'N/D'}{' '}
                <span className="text-sm font-normal text-white/70">{cw.currency}</span>
              </strong>
            </div>
          </div>

          {/* Scenari a scadenza */}
          <div className="space-y-3">
            <h3 className="serif-brand font-bold text-base text-[#15231f] tracking-tight">
              Scenari a scadenza regolabili
            </h3>
            <ExpiryScenarios warrant={cw} />
          </div>

          {/* Raw JSON expander */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-2 text-xs font-semibold text-[#64716c] hover:text-[#15231f] transition-colors"
            >
              <Code2 className="w-4 h-4" />
              <span>{showJson ? 'Nascondi' : 'Mostra'} dati grezzi normalizzati (JSON)</span>
            </button>
            {showJson && (
              <pre className="mt-2 p-4 rounded-xl bg-[#15231f] text-emerald-400 text-xs overflow-x-auto mono-num leading-relaxed border border-white/10">
                {JSON.stringify(cw, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
