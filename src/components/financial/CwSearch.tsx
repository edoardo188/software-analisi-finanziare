import React, { useState, useMemo } from 'react';
import {
  CoveredWarrant,
  TargetParameters,
  TargetProjection,
  WarrantType,
} from '../../types';
import {
  INDEX_UNDERLYINGS,
  COMMODITY_UNDERLYINGS,
  STOCK_UNDERLYINGS,
  SPOT_PRICES,
  INITIAL_COVERED_WARRANTS,
} from '../../data/cwCatalog';
import {
  spreadPct,
  rankTargetCandidates,
  isPut,
} from '../../lib/cwEngine';
import {
  Search,
  Target,
  Shield,
  Filter,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';

interface CwSearchProps {
  onSelectForAnalysis: (isin: string) => void;
}

export const CwSearch: React.FC<CwSearchProps> = ({ onSelectForAnalysis }) => {
  const [assetCategory, setAssetCategory] = useState<'Azione' | 'Indice' | 'Materia prima'>('Indice');
  const [selectedStockTicker, setSelectedStockTicker] = useState<string>('AMD');
  const [selectedIndex, setSelectedIndex] = useState<string>('FTSE MIB');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Oro');

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('Tutti');
  const [issuerFilter, setIssuerFilter] = useState<string>('Tutti');
  const [expiryFilter, setExpiryFilter] = useState<string>('Tutte');
  const [barrierFilter, setBarrierFilter] = useState<string>('Tutte');

  // Target Inverse Search parameters
  const [targetEnabled, setTargetEnabled] = useState<boolean>(false);
  const [horizonMonths, setHorizonMonths] = useState<number>(3);
  const [underlyingUpPct, setUnderlyingUpPct] = useState<number>(10.0);
  const [minimumCwReturnPct, setMinimumCwReturnPct] = useState<number>(30.0);
  const [maxCwDrawdownPct, setMaxCwDrawdownPct] = useState<number>(30.0);
  const [downsidePreset, setDownsidePreset] = useState<string>('Simmetrico al rialzo');
  const [customDownsidePct, setCustomDownsidePct] = useState<number>(10.0);
  const [riskFreeRatePct, setRiskFreeRatePct] = useState<number>(2.0);

  // Selected warrant for action
  const [selectedIsinForAction, setSelectedIsinForAction] = useState<string>('');

  // Active underlying details
  const activeUnderlyingName = useMemo(() => {
    if (assetCategory === 'Azione') {
      const match = STOCK_UNDERLYINGS.find(
        (s) => s.ticker.toUpperCase() === selectedStockTicker.trim().toUpperCase()
      );
      return match ? match.name : selectedStockTicker.trim().toUpperCase();
    }
    if (assetCategory === 'Indice') return selectedIndex;
    return selectedCommodity;
  }, [assetCategory, selectedStockTicker, selectedIndex, selectedCommodity]);

  const activeSpotInfo = useMemo(() => {
    if (assetCategory === 'Azione') {
      const match = STOCK_UNDERLYINGS.find(
        (s) => s.ticker.toUpperCase() === selectedStockTicker.trim().toUpperCase()
      );
      return match ? { price: match.spot, currency: match.currency } : { price: 100, currency: 'USD' };
    }
    return SPOT_PRICES[activeUnderlyingName] || { price: 1000, currency: 'EUR' };
  }, [assetCategory, selectedStockTicker, activeUnderlyingName]);

  // Catalog products for this underlying
  const products = useMemo(() => {
    return INITIAL_COVERED_WARRANTS.filter((cw) => {
      const matchName =
        cw.underlying_name.toLowerCase() === activeUnderlyingName.toLowerCase() ||
        (cw.underlying_ticker &&
          cw.underlying_ticker.toLowerCase() === activeUnderlyingName.toLowerCase());
      return matchName;
    });
  }, [activeUnderlyingName]);

  // Calculate downside percentage based on preset
  const calculatedDownsidePct = useMemo(() => {
    if (downsidePreset === 'Moderato (metà del rialzo)') return underlyingUpPct / 2;
    if (downsidePreset === 'Simmetrico al rialzo') return underlyingUpPct;
    if (downsidePreset === 'Stress (1,5× il rialzo)') return underlyingUpPct * 1.5;
    return customDownsidePct;
  }, [downsidePreset, underlyingUpPct, customDownsidePct]);

  // Target Parameters object
  const targetParams: TargetParameters = useMemo(
    () => ({
      horizon_months: horizonMonths,
      underlying_up_pct: underlyingUpPct,
      minimum_cw_return_pct: minimumCwReturnPct,
      maximum_cw_drawdown_pct: maxCwDrawdownPct,
      underlying_down_pct: calculatedDownsidePct,
      risk_free_rate_pct: riskFreeRatePct,
    }),
    [
      horizonMonths,
      underlyingUpPct,
      minimumCwReturnPct,
      maxCwDrawdownPct,
      calculatedDownsidePct,
      riskFreeRatePct,
    ]
  );

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (typeFilter !== 'Tutti' && p.warrant_type !== typeFilter) return false;
      if (issuerFilter !== 'Tutti' && p.issuer !== issuerFilter) return false;
      if (expiryFilter !== 'Tutte' && p.expiry !== expiryFilter) return false;
      return true;
    });
  }, [products, typeFilter, issuerFilter, expiryFilter]);

  // Target projections if enabled
  const { candidates: targetCandidates, coverageProjections } = useMemo(() => {
    if (!targetEnabled) return { candidates: [], coverageProjections: [] };
    return rankTargetCandidates(filteredProducts, targetParams, 50);
  }, [targetEnabled, filteredProducts, targetParams]);

  const targetProjectionsMap = useMemo(() => {
    const map = new Map<string, TargetProjection>();
    targetCandidates.forEach((item) => map.set(item.product.isin, item));
    return map;
  }, [targetCandidates]);

  const displayList = targetEnabled
    ? targetCandidates.map((c) => c.product)
    : filteredProducts;

  // Available filters options
  const availableIssuers = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.issuer))).sort();
  }, [products]);

  const availableExpiries = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.expiry))).sort();
  }, [products]);

  return (
    <div className="space-y-6">
      {/* Category & Underlying Selection */}
      <div className="p-6 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-5">
        <div>
          <h3 className="serif-brand font-bold text-base text-[#15231f]">
            Cerca Covered Warrant per sottostante
          </h3>
          <p className="text-xs text-[#64716c]">
            Ricerca aggregata nei cataloghi ufficiali Vontobel, UniCredit OneMarkets, Société Générale e BNP Paribas.
          </p>
        </div>

        {/* Radio Category */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Azione', 'Indice', 'Materia prima'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setAssetCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                assetCategory === cat
                  ? 'bg-[#15231f] text-white shadow-sm'
                  : 'bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#15231f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Selector Input */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="sm:col-span-2">
            {assetCategory === 'Azione' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64716c]">Ticker azione</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedStockTicker}
                    onChange={(e) => setSelectedStockTicker(e.target.value.toUpperCase())}
                    placeholder="es. AMD, ENI, MSFT, NVDA"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#15231f]/15 focus:border-[#15231f] focus:outline-none mono-num text-sm font-semibold uppercase"
                  />
                  <div className="flex gap-1 overflow-x-auto">
                    {['AMD', 'ENI', 'MSFT', 'NVDA', 'TSLA'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedStockTicker(t)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#15231f]/5 hover:bg-[#15231f]/10 font-medium"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : assetCategory === 'Indice' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64716c]">Indice di riferimento</label>
                <select
                  value={selectedIndex}
                  onChange={(e) => setSelectedIndex(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#15231f]/15 focus:border-[#15231f] focus:outline-none text-sm font-medium bg-white"
                >
                  {INDEX_UNDERLYINGS.map((idx) => (
                    <option key={idx} value={idx}>
                      {idx}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#64716c]">Materia prima</label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#15231f]/15 focus:border-[#15231f] focus:outline-none text-sm font-medium bg-white"
                >
                  {COMMODITY_UNDERLYINGS.map((comm) => (
                    <option key={comm} value={comm}>
                      {comm}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs">
            <span className="text-emerald-800 font-medium block">Sottostante attivo:</span>
            <strong className="text-emerald-950 font-bold block text-sm">{activeUnderlyingName}</strong>
            <span className="mono-num text-emerald-800 font-semibold">
              Spot: {activeSpotInfo.price.toLocaleString('it-IT')} {activeSpotInfo.currency} ·{' '}
              {products.length} CW nei cataloghi
            </span>
          </div>
        </div>
      </div>

      {/* Filters & TARGET Reverse Search */}
      <div className="p-6 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#15231f]/5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#15231f]" />
            <h4 className="text-sm font-bold text-[#15231f]">Filtri di catalogo</h4>
          </div>
          <button
            type="button"
            onClick={() => setTargetEnabled(!targetEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              targetEnabled
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#15231f]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Filtro TARGET: {targetEnabled ? 'Attivo' : 'Disattivato'}</span>
          </button>
        </div>

        {/* Standard Catalog Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[#64716c] block mb-1">Tipo strumento</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#15231f]/15 bg-white text-xs"
            >
              <option value="Tutti">Tutti</option>
              <option value="CALL">Solo CALL</option>
              <option value="PUT">Solo PUT</option>
            </select>
          </div>

          <div>
            <label className="text-[#64716c] block mb-1">Emittente</label>
            <select
              value={issuerFilter}
              onChange={(e) => setIssuerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#15231f]/15 bg-white text-xs"
            >
              <option value="Tutti">Tutti gli emittenti</option>
              {availableIssuers.map((iss) => (
                <option key={iss} value={iss}>
                  {iss}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#64716c] block mb-1">Scadenza</label>
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#15231f]/15 bg-white text-xs"
            >
              <option value="Tutte">Tutte le scadenze</option>
              {availableExpiries.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#64716c] block mb-1">Barriera</label>
            <select
              value={barrierFilter}
              onChange={(e) => setBarrierFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#15231f]/15 bg-white text-xs"
            >
              <option value="Tutte">Tutte</option>
              <option value="Senza barriera">Senza barriera (Plain vanilla)</option>
            </select>
          </div>
        </div>

        {/* TARGET Reverse Search Panel */}
        {targetEnabled && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-4 text-xs animate-fade-in">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-amber-700 mt-0.5" />
              <div>
                <strong className="text-amber-900 font-semibold block text-sm">
                  Ricerca Inversa TARGET (Black-Scholes + Stima Volatilità Implicita)
                </strong>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Cerca fino a 50 Call che raggiungono il rendimento minimo atteso e rispettano il drawdown massimo desiderato nello scenario negativo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Periodo previsto (mesi): {horizonMonths}m
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={horizonMonths}
                    onChange={(e) => setHorizonMonths(parseInt(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Rialzo atteso sottostante (%): +{underlyingUpPct}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="0.5"
                    value={underlyingUpPct}
                    onChange={(e) => setUnderlyingUpPct(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Rendimento minimo CW (%): {minimumCwReturnPct}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={minimumCwReturnPct}
                    onChange={(e) => setMinimumCwReturnPct(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Max drawdown accettabile CW (%): {maxCwDrawdownPct}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={maxCwDrawdownPct}
                    onChange={(e) => setMaxCwDrawdownPct(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Scenario ribasso sottostante
                  </label>
                  <select
                    value={downsidePreset}
                    onChange={(e) => setDownsidePreset(e.target.value)}
                    className="w-full p-1.5 rounded border border-[#15231f]/15 text-xs bg-white"
                  >
                    <option value="Moderato (metà del rialzo)">Moderato (metà del rialzo: −{(underlyingUpPct / 2).toFixed(1)}%)</option>
                    <option value="Simmetrico al rialzo">Simmetrico al rialzo: −{underlyingUpPct.toFixed(1)}%</option>
                    <option value="Stress (1,5× il rialzo)">Stress (1,5× il rialzo: −{(underlyingUpPct * 1.5).toFixed(1)}%)</option>
                    <option value="Personalizzato">Personalizzato</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-[#15231f] block mb-1">
                    Tasso risk-free annuo: {riskFreeRatePct}%
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={riskFreeRatePct}
                    onChange={(e) => setRiskFreeRatePct(parseFloat(e.target.value) || 2.0)}
                    className="w-full p-1 rounded border border-[#15231f]/15 mono-num text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="serif-brand font-bold text-base text-[#15231f]">
            {targetEnabled
              ? `Risultati TARGET (${displayList.length} su ${filteredProducts.length}, massimo 50)`
              : `Risultati catalogo (${displayList.length})`}
          </h3>
          <p className="text-xs text-[#64716c]">
            {targetEnabled
              ? 'Call ordinati dando priorità al rendimento target teorico.'
              : 'Seleziona un Covered Warrant per visualizzare l\'analisi quantitativa completa.'}
          </p>
        </div>

        {displayList.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={selectedIsinForAction || displayList[0].isin}
              onChange={(e) => setSelectedIsinForAction(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#15231f]/15 text-xs mono-num bg-white"
            >
              {displayList.map((p) => (
                <option key={p.isin} value={p.isin}>
                  {p.isin} · {p.issuer} · Strike {p.strike}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSelectForAnalysis(selectedIsinForAction || displayList[0].isin)}
              className="px-3.5 py-1.5 rounded-xl bg-[#15231f] text-white hover:bg-[#20342e] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Analizza ISIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      {displayList.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-[#15231f]/10 text-center space-y-2">
          <Info className="w-8 h-8 text-[#64716c] mx-auto opacity-50" />
          <h4 className="text-sm font-semibold text-[#15231f]">
            {targetEnabled
              ? 'Nessun Call soddisfa contemporaneamente rendimento e drawdown.'
              : 'Nessun Covered Warrant corrisponde ai filtri selezionati.'}
          </h4>
          <p className="text-xs text-[#64716c]">
            {targetEnabled
              ? 'Prova ad ampliare il drawdown massimo accettabile o ridurre il rendimento minimo desiderato.'
              : 'Prova a modificare i filtri per ampliare la ricerca.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#15231f]/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ISIN</th>
                  <th className="py-3 px-4">Emittente</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Strike</th>
                  <th className="py-3 px-4">Scadenza</th>
                  <th className="py-3 px-4">Ratio</th>
                  <th className="py-3 px-4">Bid / Ask</th>
                  <th className="py-3 px-4">Spread %</th>
                  <th className="py-3 px-4">Delta</th>
                  <th className="py-3 px-4">Omega</th>
                  {targetEnabled && (
                    <>
                      <th className="py-3 px-4 text-emerald-800 bg-emerald-50/50">Rendimento Target</th>
                      <th className="py-3 px-4 text-rose-800 bg-rose-50/50">Drawdown CW %</th>
                      <th className="py-3 px-4">Vol. Implicita</th>
                      <th className="py-3 px-4">Metodo</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15231f]/5">
                {displayList.map((product) => {
                  const spr = spreadPct(product.bid, product.ask);
                  const projection = targetProjectionsMap.get(product.isin);

                  return (
                    <tr key={product.isin} className="hover:bg-[#f7f5ef]/50 transition-colors">
                      <td className="py-3 px-4 font-bold mono-num text-[#15231f]">{product.isin}</td>
                      <td className="py-3 px-4 font-medium">{product.issuer}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPut(product.warrant_type)
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.warrant_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 mono-num font-semibold">{product.strike}</td>
                      <td className="py-3 px-4 mono-num text-[#64716c]">{product.expiry}</td>
                      <td className="py-3 px-4 mono-num">{product.ratio}</td>
                      <td className="py-3 px-4 mono-num font-medium">
                        {product.bid?.toFixed(3) ?? 'N/D'} / {product.ask?.toFixed(3) ?? 'N/D'}
                      </td>
                      <td className="py-3 px-4 mono-num">
                        {spr !== null ? `${(spr * 100).toFixed(2)}%` : 'N/D'}
                      </td>
                      <td className="py-3 px-4 mono-num">{product.delta?.toFixed(2) ?? 'N/D'}</td>
                      <td className="py-3 px-4 mono-num">{product.omega?.toFixed(2) ?? 'N/D'}</td>
                      {targetEnabled && (
                        <>
                          <td className="py-3 px-4 mono-num font-bold text-emerald-700 bg-emerald-50/30">
                            +{projection?.upside_return_pct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 mono-num font-bold text-rose-700 bg-rose-50/30">
                            −{projection?.downside_drawdown_pct.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 mono-num text-[#64716c]">
                            {projection?.implied_volatility
                              ? `${(projection.implied_volatility * 100).toFixed(1)}%`
                              : 'N/D'}
                          </td>
                          <td className="py-3 px-4 text-[10px] text-[#64716c]">{projection?.method}</td>
                        </>
                      )}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectForAnalysis(product.isin)}
                          className="px-2.5 py-1 rounded-lg bg-[#15231f]/5 hover:bg-[#15231f] hover:text-white font-semibold transition-all text-[11px]"
                        >
                          Dettaglio
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Put Hedging Coverage Expander */}
      {targetEnabled && coverageProjections.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-sm text-[#15231f]">
              🛡️ POSSIBILI COPERTURE ({coverageProjections.length} Put valutabili)
            </h4>
          </div>
          <p className="text-xs text-[#64716c]">
            Put ordinati per rendimento teorico nello scenario negativo del sottostante (−{calculatedDownsidePct.toFixed(1)}%).
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f5ef] text-[#64716c] uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ISIN Put</th>
                  <th className="py-2.5 px-3">Emittente</th>
                  <th className="py-2.5 px-3">Strike</th>
                  <th className="py-2.5 px-3">Scadenza</th>
                  <th className="py-2.5 px-3">Ask</th>
                  <th className="py-2.5 px-3 text-emerald-800">Rendimento con Ribasso</th>
                  <th className="py-2.5 px-3 text-rose-800">Rendimento se Sale</th>
                  <th className="py-2.5 px-3">Metodo</th>
                  <th className="py-2.5 px-3 text-right">Azione</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#15231f]/5">
                {coverageProjections.slice(0, 10).map((cov) => (
                  <tr key={cov.product.isin} className="hover:bg-[#f7f5ef]/40">
                    <td className="py-2.5 px-3 font-bold mono-num">{cov.product.isin}</td>
                    <td className="py-2.5 px-3">{cov.product.issuer}</td>
                    <td className="py-2.5 px-3 mono-num">{cov.product.strike}</td>
                    <td className="py-2.5 px-3 mono-num text-[#64716c]">{cov.product.expiry}</td>
                    <td className="py-2.5 px-3 mono-num">{cov.product.ask?.toFixed(3)}</td>
                    <td className="py-2.5 px-3 mono-num font-bold text-emerald-700">
                      +{cov.downside_return_pct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 mono-num font-bold text-rose-700">
                      {cov.upside_return_pct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-[#64716c]">{cov.method}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectForAnalysis(cov.product.isin)}
                        className="px-2 py-0.5 rounded bg-[#15231f]/5 hover:bg-[#15231f] hover:text-white font-medium text-[11px]"
                      >
                        Analizza
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
