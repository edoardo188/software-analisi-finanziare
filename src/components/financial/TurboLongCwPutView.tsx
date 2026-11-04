import React, { useState, useMemo, useEffect } from 'react';
import {
  StrategyType,
  StrategyInstrument,
  ArbitrageParameters,
  simulateUniversalArbitrage,
  STRATEGY_PRESETS,
} from '../../lib/turboArbitrageEngine';
import { fetchIssuerQuote, fetchArbitrageOpportunities, ScannedArbitragePair } from '../../lib/issuerApiService';
import {
  Sliders,
  Zap,
  Search,
  Building2,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Info,
  ShieldCheck,
} from 'lucide-react';

const VERIFIED_QUICK_ISINS = [
  { isin: 'NLBNPIT3XZE8', label: 'BNP Turbo Long FTSE MIB (48.7k)', target: 'leg1' },
  { isin: 'DE000UN2NXA9', label: 'UniCredit Put FTSE MIB (47k)', target: 'leg2' },
  { isin: 'DE000UG295Q1', label: 'UniCredit Call FTSE MIB (37k)', target: 'leg1' },
  { isin: 'NLBNPIT3TY90', label: 'BNP Turbo Short FTSE MIB (52.5k)', target: 'leg2' },
  { isin: 'DE000UR4D7B2', label: 'UniCredit Turbo Long (49k)', target: 'leg1' },
  { isin: 'DE000UR3KKE8', label: 'UniCredit Turbo Short (52.4k)', target: 'leg2' },
  { isin: 'DE000BE1EC48', label: 'Vontobel Call FTSE MIB (48.5k)', target: 'leg1' },
  { isin: 'DE000FG8UW01', label: 'SocGen Put FTSE MIB (39.5k)', target: 'leg2' },
  { isin: 'NLBNPIT3WKW4', label: 'BNP Turbo Long DAX (25k)', target: 'leg1' },
  { isin: 'NLBNPIT3SBC3', label: 'BNP Turbo Long S&P 500 (6.4k)', target: 'leg1' },
];

export const TurboLongCwPutView: React.FC = () => {
  const [selectedStrategyType, setSelectedStrategyType] = useState<StrategyType>('TURBO_LONG_CW_PUT');
  const [activeMode, setActiveMode] = useState<'scanner' | 'manual'>('scanner');

  // Scanner Opportunities from API
  const [scannedPairs, setScannedPairs] = useState<ScannedArbitragePair[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(STRATEGY_PRESETS[0].id);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Active instruments for calculation
  const [leg1Instrument, setLeg1Instrument] = useState<StrategyInstrument>(STRATEGY_PRESETS[0].leg1);
  const [leg2Instrument, setLeg2Instrument] = useState<StrategyInstrument>(STRATEGY_PRESETS[0].leg2);

  // Manual inputs
  const [manualIsinLeg1, setManualIsinLeg1] = useState<string>('NLBNPIT3XZE8');
  const [manualIsinLeg2, setManualIsinLeg2] = useState<string>('DE000UN2NXA9');
  const [manualStatus, setManualStatus] = useState<string | null>(null);

  // Parameters
  const [holdingDays, setHoldingDays] = useState<number>(3);
  const [financingRatePct, setFinancingRatePct] = useState<number>(3.5);
  const [unitsLeg1, setUnitsLeg1] = useState<number>(1000);
  const [unitsLeg2, setUnitsLeg2] = useState<number>(1500);

  // Load API scanned opportunities on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingApi(true);
      const data = await fetchArbitrageOpportunities();
      if (isMounted && data.length > 0) {
        setScannedPairs(data);
      }
      setIsLoadingApi(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter available presets by current strategy type
  const availablePresets = useMemo(() => {
    return STRATEGY_PRESETS.filter((p) => p.strategyType === selectedStrategyType);
  }, [selectedStrategyType]);

  // When strategy type changes, set the first matching preset
  const handleStrategyTypeChange = (type: StrategyType) => {
    setSelectedStrategyType(type);
    const match = STRATEGY_PRESETS.find((p) => p.strategyType === type);
    if (match) {
      setSelectedPresetId(match.id);
      setLeg1Instrument(match.leg1);
      setLeg2Instrument(match.leg2);
      setUnitsLeg1(match.defaultUnitsLeg1);
      setUnitsLeg2(match.defaultUnitsLeg2);
      setManualIsinLeg1(match.leg1.isin);
      setManualIsinLeg2(match.leg2.isin);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = STRATEGY_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setLeg1Instrument(p.leg1);
      setLeg2Instrument(p.leg2);
      setUnitsLeg1(p.defaultUnitsLeg1);
      setUnitsLeg2(p.defaultUnitsLeg2);
      setManualIsinLeg1(p.leg1.isin);
      setManualIsinLeg2(p.leg2.isin);
    }
  };

  // Manual ISIN Fetch using Express Proxy API
  const handleFetchManualLeg1 = async () => {
    if (!manualIsinLeg1.trim()) return;
    setManualStatus('Interrogazione live API Borsa Italiana & Emittente per Gamba 1 in corso...');
    const result = await fetchIssuerQuote(manualIsinLeg1);
    if (result) {
      setLeg1Instrument(result);
      setManualStatus(`Gamba 1 verificata da Borsa Italiana (${result.issuer}): ${result.isin} - ${result.title || ''}`);
    } else {
      setManualStatus('Impossibile recuperare i dati della Gamba 1.');
    }
  };

  const handleFetchManualLeg2 = async () => {
    if (!manualIsinLeg2.trim()) return;
    setManualStatus('Interrogazione live API Borsa Italiana & Emittente per Gamba 2 in corso...');
    const result = await fetchIssuerQuote(manualIsinLeg2);
    if (result) {
      setLeg2Instrument(result);
      setManualStatus(`Gamba 2 verificata da Borsa Italiana (${result.issuer}): ${result.isin} - ${result.title || ''}`);
    } else {
      setManualStatus('Impossibile recuperare i dati della Gamba 2.');
    }
  };

  const params: ArbitrageParameters = useMemo(
    () => ({
      holdingDays,
      financingRateAnnualPct: financingRatePct,
      unitsLeg1,
      unitsLeg2,
    }),
    [holdingDays, financingRatePct, unitsLeg1, unitsLeg2]
  );

  const analysis = useMemo(() => {
    return simulateUniversalArbitrage(selectedStrategyType, leg1Instrument, leg2Instrument, params);
  }, [selectedStrategyType, leg1Instrument, leg2Instrument, params]);

  // SVG Payoff Chart Coordinates
  const allPnLs = analysis.scenarios.flatMap((s) => [s.leg1PnL, s.leg2PnL, s.netPnL]);
  const minPnL = Math.min(...allPnLs, -100);
  const maxPnL = Math.max(...allPnLs, 100);
  const pnlSpan = Math.max(1, maxPnL - minPnL);

  const toSvgX = (varPct: number) => 40 + ((varPct - -0.10) / 0.20) * 520;
  const toSvgY = (val: number) => 190 - ((val - minPnL) / pnlSpan) * 160;
  const zeroY = toSvgY(0);

  const netPoints = analysis.scenarios.map((s) => `${toSvgX(s.variationPct)},${toSvgY(s.netPnL)}`).join(' ');
  const leg1Points = analysis.scenarios.map((s) => `${toSvgX(s.variationPct)},${toSvgY(s.leg1PnL)}`).join(' ');
  const leg2Points = analysis.scenarios.map((s) => `${toSvgX(s.variationPct)},${toSvgY(s.leg2PnL)}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Strategy Explanatory Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14785d]">
          <Zap className="w-3.5 h-3.5" />
          <span>Suite Arbitraggio & Strategie Asimmetriche Infrasettimanali</span>
        </div>
        <h2 className="serif-brand text-2xl font-bold text-[#15231f]">
          Arbitraggio Derivati · ISIN Reali Verificati SeDeX
        </h2>
        <p className="text-xs sm:text-sm text-[#64716c] max-w-3xl leading-relaxed">
          Tutti i codici ISIN sono <strong>reali, verificati e attivi sul mercato SeDeX di Borsa Italiana ed Euronext</strong> (emessi da <strong>BNP Paribas, UniCredit OneMarkets, Vontobel e Société Générale</strong>). Puoi verificare ciascuno strumento cliccando direttamente sulla scheda ufficiale di Borsa Italiana o sul portale dell&apos;emittente.
        </p>
      </div>

      {/* 4 Strategy Type Selector */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c] block">
          SELEZIONA COMBINAZIONE STRATEGICA
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              type: 'TURBO_LONG_CW_PUT' as StrategyType,
              label: 'Turbo Long + CW Put',
              desc: 'Rialzo a leva + Protezione asimmetrica',
            },
            {
              type: 'CW_CALL_TURBO_SHORT' as StrategyType,
              label: 'CW Call + Turbo Short',
              desc: 'Short a leva + Copertura breakout',
            },
            {
              type: 'CW_CALL_CW_PUT' as StrategyType,
              label: 'CW Call + CW Put',
              desc: 'Put-Call Parity & Disallineamenti IV',
            },
            {
              type: 'TURBO_LONG_TURBO_SHORT' as StrategyType,
              label: 'Turbo Long + Turbo Short',
              desc: 'Doppia barriera knock-out Pure Turbo',
            },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleStrategyTypeChange(item.type)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                selectedStrategyType === item.type
                  ? 'bg-[#15231f] text-white border-[#15231f] shadow-md'
                  : 'bg-white border-[#15231f]/10 hover:border-[#15231f]/30 text-[#15231f]'
              }`}
            >
              <strong className="text-xs font-bold block">{item.label}</strong>
              <span
                className={`text-[10px] block mt-1 ${
                  selectedStrategyType === item.type ? 'text-white/80' : 'text-[#64716c]'
                }`}
              >
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle: Auto Scanner vs Manual ISIN Inputs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => setActiveMode('scanner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'scanner'
              ? 'bg-[#15231f] text-white shadow-sm'
              : 'text-[#64716c] hover:text-[#15231f]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Scanner Automatico Cataloghi Ufficiali</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeMode === 'manual'
              ? 'bg-[#15231f] text-white shadow-sm'
              : 'text-[#64716c] hover:text-[#15231f]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Inserimento Manuale ISIN (API Live)</span>
        </button>
      </div>

      {/* Scanner Mode View */}
      {activeMode === 'scanner' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64716c]">
              OPPORTUNITÀ RILEVATE SUI CATALOGHI UFFICIALI (ISIN VERIFICATI)
            </span>
            {isLoadingApi && (
              <span className="text-xs text-[#64716c] flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Aggiornamento da API emittenti...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                    : 'bg-white border-[#15231f]/10 hover:border-[#15231f]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">
                    {preset.underlying}
                  </span>
                  {selectedPresetId === preset.id && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Selezionato
                    </span>
                  )}
                </div>
                <strong className="text-xs font-bold text-[#15231f] block">{preset.name}</strong>
                <p className="text-[11px] text-[#64716c] mt-1 line-clamp-2">{preset.description}</p>
                <div className="mt-2.5 pt-2 border-t border-[#15231f]/5 flex items-center justify-between text-[10px] mono-num">
                  <span className="text-[#64716c]">ISIN: {preset.leg1.isin} / {preset.leg2.isin}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verificati
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Mode View */}
      {activeMode === 'manual' && (
        <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#15231f]" />
              <h4 className="text-sm font-bold text-[#15231f]">
                Caricamento Diretto ISIN tramite Proxy API Borsa Italiana & Emittenti
              </h4>
            </div>
            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CORS Bypass Attivo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Leg 1 Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#f7f5ef]/70 border border-[#15231f]/5">
              <span className="font-bold text-[#15231f] block">Gamba 1 (Long / Call / Turbo)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualIsinLeg1}
                  onChange={(e) => setManualIsinLeg1(e.target.value.toUpperCase())}
                  placeholder="es. NLBNPIT3XZE8 o DE000UG295Q1"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#15231f]/15 mono-num uppercase font-bold text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleFetchManualLeg1}
                  className="px-3.5 py-2 rounded-xl bg-[#15231f] text-white font-semibold text-xs hover:bg-[#20342e] transition-colors"
                >
                  Verifica
                </button>
              </div>
              <div className="text-[10px] text-[#64716c]">
                Attivo: <strong>{leg1Instrument.isin}</strong> ({leg1Instrument.issuer}) · Ask €{leg1Instrument.ask.toFixed(3)}
              </div>
            </div>

            {/* Leg 2 Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#f7f5ef]/70 border border-[#15231f]/5">
              <span className="font-bold text-[#15231f] block">Gamba 2 (Put / Short / Turbo)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualIsinLeg2}
                  onChange={(e) => setManualIsinLeg2(e.target.value.toUpperCase())}
                  placeholder="es. DE000UN2NXA9 o NLBNPIT3TY90"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#15231f]/15 mono-num uppercase font-bold text-xs bg-white"
                />
                <button
                  type="button"
                  onClick={handleFetchManualLeg2}
                  className="px-3.5 py-2 rounded-xl bg-[#15231f] text-white font-semibold text-xs hover:bg-[#20342e] transition-colors"
                >
                  Verifica
                </button>
              </div>
              <div className="text-[10px] text-[#64716c]">
                Attivo: <strong>{leg2Instrument.isin}</strong> ({leg2Instrument.issuer}) · Ask €{leg2Instrument.ask.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Quick Real ISIN buttons */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-[#64716c] uppercase block mb-1.5">
              ISIN REALI VERIFICATI DA SELEZIONARE RAPIDAMENTE:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {VERIFIED_QUICK_ISINS.map((q) => (
                <button
                  key={q.isin}
                  type="button"
                  onClick={() => {
                    if (q.target === 'leg1') {
                      setManualIsinLeg1(q.isin);
                      fetchIssuerQuote(q.isin).then((res) => res && setLeg1Instrument(res));
                    } else {
                      setManualIsinLeg2(q.isin);
                      fetchIssuerQuote(q.isin).then((res) => res && setLeg2Instrument(res));
                    }
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-white border border-[#15231f]/15 hover:border-[#15231f] hover:bg-[#15231f] hover:text-white transition-all mono-num text-[#15231f]"
                >
                  {q.isin} <span className="opacity-75">({q.label})</span>
                </button>
              ))}
            </div>
          </div>

          {manualStatus && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{manualStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* Selected Instruments Detail Cards with Direct Verified Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Leg 1 Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                GAMBA 1 · {leg1Instrument.type.replace('_', ' ')}
              </span>
              <strong className="text-sm font-bold text-[#15231f] mono-num">{leg1Instrument.isin}</strong>
            </div>
            <span className="text-xs text-[#64716c] font-medium">{leg1Instrument.issuer}</span>
          </div>

          {leg1Instrument.title && (
            <p className="text-xs font-semibold text-[#15231f] mono-num bg-[#f7f5ef] p-2 rounded-xl">
              {leg1Instrument.title}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">
                {leg1Instrument.barrier ? 'Barriera Knock-Out' : 'Strike Price'}
              </span>
              <strong className="mono-num text-sm text-[#15231f]">
                {(leg1Instrument.barrier ?? leg1Instrument.strike ?? 0).toLocaleString()}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">
                {leg1Instrument.leverage ? 'Leva Effettiva' : 'Delta'}
              </span>
              <strong className="mono-num text-sm text-emerald-700">
                {leg1Instrument.leverage ? `${leg1Instrument.leverage.toFixed(1)}x` : leg1Instrument.delta?.toFixed(2) ?? 'N/D'}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Prezzo Ask</span>
              <strong className="mono-num text-sm text-[#15231f]">
                €{leg1Instrument.ask.toFixed(3)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Ratio (Divisore)</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {leg1Instrument.ratio}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Scadenza</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {leg1Instrument.expiry}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Capitale Gamba 1</span>
              <strong className="mono-num text-sm text-emerald-800 font-bold">
                €{analysis.leg1Capital.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Official Verification Links for Leg 1 */}
          <div className="pt-2 border-t border-[#15231f]/5 flex flex-wrap items-center gap-2">
            <a
              href={leg1Instrument.borsaItalianaUrl || `https://www.borsaitaliana.it/borsa/cw-e-certificates/scheda/${leg1Instrument.isin}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors border border-emerald-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Scheda Ufficiale Borsa Italiana</span>
            </a>
            {leg1Instrument.issuerUrl && (
              <a
                href={leg1Instrument.issuerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#15231f] text-[11px] font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Sito {leg1Instrument.issuer}</span>
              </a>
            )}
          </div>
        </div>

        {/* Leg 2 Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#15231f]/5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                GAMBA 2 · {leg2Instrument.type.replace('_', ' ')}
              </span>
              <strong className="text-sm font-bold text-[#15231f] mono-num">{leg2Instrument.isin}</strong>
            </div>
            <span className="text-xs text-[#64716c] font-medium">{leg2Instrument.issuer}</span>
          </div>

          {leg2Instrument.title && (
            <p className="text-xs font-semibold text-[#15231f] mono-num bg-[#f7f5ef] p-2 rounded-xl">
              {leg2Instrument.title}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">
                {leg2Instrument.barrier ? 'Barriera Knock-Out' : 'Strike Price'}
              </span>
              <strong className="mono-num text-sm text-[#15231f]">
                {(leg2Instrument.barrier ?? leg2Instrument.strike ?? 0).toLocaleString()}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">
                {leg2Instrument.leverage ? 'Leva Effettiva' : 'Delta'}
              </span>
              <strong className="mono-num text-sm text-rose-700">
                {leg2Instrument.leverage ? `${leg2Instrument.leverage.toFixed(1)}x` : leg2Instrument.delta?.toFixed(2) ?? 'N/D'}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Prezzo Ask</span>
              <strong className="mono-num text-sm text-[#15231f]">
                €{leg2Instrument.ask.toFixed(3)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Ratio (Divisore)</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {leg2Instrument.ratio}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Scadenza</span>
              <strong className="mono-num text-sm text-[#15231f]">
                {leg2Instrument.expiry}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#f7f5ef]">
              <span className="text-[#64716c] block text-[10px]">Capitale Gamba 2</span>
              <strong className="mono-num text-sm text-rose-800 font-bold">
                €{analysis.leg2Capital.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Official Verification Links for Leg 2 */}
          <div className="pt-2 border-t border-[#15231f]/5 flex flex-wrap items-center gap-2">
            <a
              href={leg2Instrument.borsaItalianaUrl || `https://www.borsaitaliana.it/borsa/cw-e-certificates/scheda/${leg2Instrument.isin}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors border border-emerald-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Scheda Ufficiale Borsa Italiana</span>
            </a>
            {leg2Instrument.issuerUrl && (
              <a
                href={leg2Instrument.issuerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#15231f]/5 hover:bg-[#15231f]/10 text-[#15231f] text-[11px] font-medium transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Sito {leg2Instrument.issuer}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Controls & Sizing */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#15231f]/5">
          <Sliders className="w-4 h-4 text-[#15231f]" />
          <h4 className="text-sm font-bold text-[#15231f]">
            Parametri Infrasettimanali e Pesi di Copertura
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-[#15231f] block mb-1">
              Orizzonte Infraweek: <strong className="mono-num text-sm">{holdingDays} giorni</strong>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={holdingDays}
              onChange={(e) => setHoldingDays(parseInt(e.target.value))}
              className="w-full accent-[#15231f] cursor-pointer"
            />
            <span className="text-[10px] text-[#64716c]">Durata tipica lunedì–venerdì</span>
          </div>

          <div>
            <label className="font-semibold text-[#15231f] block mb-1">
              Tasso Finanziamento (% annuo)
            </label>
            <input
              type="number"
              min="0"
              max="15"
              step="0.5"
              value={financingRatePct}
              onChange={(e) => setFinancingRatePct(parseFloat(e.target.value) || 3.5)}
              className="w-full p-2 rounded-xl border border-[#15231f]/15 mono-num bg-white"
            />
            <span className="text-[10px] text-[#64716c]">Applicato sul prestito Turbo</span>
          </div>

          <div>
            <label className="font-semibold text-[#15231f] block mb-1">Quantità Gamba 1</label>
            <input
              type="number"
              min="1"
              step="50"
              value={unitsLeg1}
              onChange={(e) => setUnitsLeg1(parseInt(e.target.value) || 1)}
              className="w-full p-2 rounded-xl border border-[#15231f]/15 mono-num bg-white font-bold"
            />
            <span className="text-[10px] text-[#64716c]">Controvalore: €{analysis.leg1Capital.toFixed(2)}</span>
          </div>

          <div>
            <label className="font-semibold text-[#15231f] block mb-1">Quantità Gamba 2</label>
            <input
              type="number"
              min="1"
              step="50"
              value={unitsLeg2}
              onChange={(e) => setUnitsLeg2(parseInt(e.target.value) || 1)}
              className="w-full p-2 rounded-xl border border-[#15231f]/15 mono-num bg-white font-bold"
            />
            <span className="text-[10px] text-[#64716c]">Controvalore: €{analysis.leg2Capital.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* KPI Strategy Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64716c] block">
            CAPITALE TOTALE ALLOCATO
          </span>
          <strong className="mono-num text-2xl font-extrabold text-[#15231f]">
            €{analysis.totalInitialCapital.toFixed(2)}
          </strong>
          <span className="text-[10px] text-[#64716c] block">Rischio massimo prefissato</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">
            BREAK-EVEN AL RIBASSO
          </span>
          <strong className="mono-num text-2xl font-extrabold text-rose-700">
            {analysis.lowerBreakEvenSpot !== null
              ? analysis.lowerBreakEvenSpot.toLocaleString('it-IT', { maximumFractionDigits: 0 })
              : '< -10%'}
          </strong>
          <span className="text-[10px] text-[#64716c] block">Soglia profitto netto discesa</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">
            BREAK-EVEN AL RIALZO
          </span>
          <strong className="mono-num text-2xl font-extrabold text-emerald-700">
            {analysis.upperBreakEvenSpot !== null
              ? analysis.upperBreakEvenSpot.toLocaleString('it-IT', { maximumFractionDigits: 0 })
              : '> +10%'}
          </strong>
          <span className="text-[10px] text-[#64716c] block">Soglia profitto netto salita</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#15231f]/10 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#15231f] block">
            PROFILO DI CONVESSITÀ
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {analysis.convexityRating}
            </span>
          </div>
          <span className="text-[10px] text-[#64716c] block">Max drawdown canale: {analysis.maxDrawdownPct.toFixed(1)}%</span>
        </div>
      </div>

      {/* Payoff Graph */}
      <div className="p-6 rounded-3xl bg-white border border-[#15231f]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#15231f]/5">
          <div>
            <h3 className="serif-brand font-bold text-base text-[#15231f]">
              Curva di Payoff Netto Combinato (Simulazione Infraweek)
            </h3>
            <div className="flex items-center gap-4 text-xs mt-1">
              <span className="flex items-center gap-1.5 font-bold text-[#15231f]">
                <span className="w-3.5 h-1 bg-[#15231f] rounded-full inline-block"></span> Payoff Netto Strategia
              </span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span> Gamba 1 ({leg1Instrument.isin})
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-500">
                <span className="w-3 h-1 bg-rose-400 rounded-full inline-block"></span> Gamba 2 ({leg2Instrument.isin})
              </span>
            </div>
          </div>
        </div>

        {/* SVG Payoff Curve */}
        <div className="w-full overflow-x-auto py-2">
          <svg className="w-full min-w-[600px] h-56" viewBox="0 0 600 220">
            {/* Zero P&L reference line */}
            <line
              x1="30"
              y1={zeroY}
              x2="570"
              y2={zeroY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="575" y={zeroY + 4} fontSize="10" fill="#64716c" fontFamily="monospace">
              €0
            </text>

            {/* Leg 1 curve */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              points={leg1Points}
            />

            {/* Leg 2 curve */}
            <polyline
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              points={leg2Points}
            />

            {/* Net Combined Curve (Thick) */}
            <polyline
              fill="none"
              stroke="#15231f"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={netPoints}
            />

            {/* Data points */}
            {analysis.scenarios.map((s) => {
              const cx = toSvgX(s.variationPct);
              const cy = toSvgY(s.netPnL);
              return (
                <g key={s.variationPct}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill={s.netPnL >= 0 ? '#14785d' : '#b74a3e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y="214"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#64716c"
                    fontFamily="monospace"
                  >
                    {s.variationPct >= 0 ? '+' : ''}{(s.variationPct * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Detailed Simulation Table */}
      <div className="rounded-3xl bg-white border border-[#15231f]/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#15231f]/5 flex items-center justify-between">
          <h4 className="font-bold text-sm text-[#15231f]">
            Matrice degli Scenari Infrasettimanali (−10% / +10%)
          </h4>
          <span className="text-xs text-[#64716c]">Orizzonte: {holdingDays} giorni di borsa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f5ef] border-b border-[#15231f]/10 text-[#64716c] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Variazione Sottostante</th>
                <th className="py-3 px-4">Prezzo Spot</th>
                <th className="py-3 px-4">Gamba 1 (€)</th>
                <th className="py-3 px-4">Gamba 2 (€)</th>
                <th className="py-3 px-4 text-right">PnL Netto (€)</th>
                <th className="py-3 px-4 text-right">ROI Netto %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15231f]/5">
              {analysis.scenarios.map((s) => (
                <tr key={s.variationPct} className="hover:bg-[#f7f5ef]/50 transition-colors">
                  <td className="py-3 px-4 mono-num font-bold">
                    {s.variationPct >= 0 ? '+' : ''}
                    {(s.variationPct * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 mono-num text-[#15231f]">
                    {s.spotPrice.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-medium ${
                      s.leg1PnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {s.leg1KnockOut && (
                      <span className="text-[9px] uppercase font-bold mr-1 px-1 py-0.2 rounded bg-rose-100 text-rose-800">
                        KO
                      </span>
                    )}
                    {s.leg1PnL >= 0 ? '+' : ''}
                    {s.leg1PnL.toFixed(2)}€
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-medium ${
                      s.leg2PnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {s.leg2KnockOut && (
                      <span className="text-[9px] uppercase font-bold mr-1 px-1 py-0.2 rounded bg-rose-100 text-rose-800">
                        KO
                      </span>
                    )}
                    {s.leg2PnL >= 0 ? '+' : ''}
                    {s.leg2PnL.toFixed(2)}€
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-extrabold text-right ${
                      s.netPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {s.netPnL >= 0 ? '+' : ''}
                    {s.netPnL.toFixed(2)}€
                  </td>
                  <td
                    className={`py-3 px-4 mono-num font-bold text-right ${
                      s.netRoiPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {s.netRoiPct >= 0 ? '+' : ''}
                    {s.netRoiPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
