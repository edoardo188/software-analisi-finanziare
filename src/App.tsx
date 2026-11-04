import React, { useState } from 'react';
import { Header } from './components/Header';
import { MarketAnalyzerView } from './components/market/MarketAnalyzerView';
import { FinancialAnalyzerView } from './components/financial/FinancialAnalyzerView';
import { INITIAL_MARKETS, INITIAL_REGIME, INITIAL_SENTIMENT } from './data/marketData';
import { MarketItem, RegimeInfo, SentimentReport } from './types';

export function App() {
  const [activeApp, setActiveApp] = useState<'market' | 'financial'>('market');
  const [markets, setMarkets] = useState<MarketItem[]>(INITIAL_MARKETS);
  const [regime, setRegime] = useState<RegimeInfo>(INITIAL_REGIME);
  const [sentiment, setSentiment] = useState<SentimentReport>(INITIAL_SENTIMENT);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Oggi, 16:45 CET');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate live jitter
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.48) * 0.15;
          const newVal = m.kind === 'yield' ? m.value + delta * 0.05 : m.value * (1 + delta * 0.01);
          return {
            ...m,
            value: Math.round(newVal * 100) / 100,
            change_pct: m.kind === 'price' ? (m.change_pct ?? 0) + delta : m.change_pct,
          };
        })
      );
      const now = new Date();
      setLastUpdated(`Oggi, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} CET`);
      setIsRefreshing(false);
    }, 600);
  };

  const handleUpdateManualSentiment = (score: number) => {
    setSentiment((prev) => ({
      ...prev,
      manualScore: score,
    }));
  };

  const handleCopyChatGpt = () => {
    const promptText = `
# Briefing di Mercato Giornaliero · Market Analyzer
Data: ${lastUpdated}

## 1. Regime Probabile: ${regime.name} (Confidenza: ${regime.confidence}/100)
${regime.explanation}

Evidenze:
${regime.evidence.map((e) => `- ${e}`).join('\n')}

Scenari per la prossima seduta:
${regime.scenarios.map((s) => `- ${s.name} (${s.weight}%): ${s.condition}`).join('\n')}

## 2. Sentiment Multifattore (Fear & Greed Interno)
Punteggio: ${sentiment.manualScore ?? sentiment.score}/100 (${sentiment.label})
Driver: ${sentiment.drivers}
CNN Fear & Greed esterno: ${sentiment.cnnFearGreed ?? 'N/D'}

## 3. Asset Chiave
- S&P 500: 6,051.85 (+0.42%)
- Nasdaq 100: 21,462.40 (+0.68%)
- VIX: 14.85 (-3.85%)
- US 10Y Yield: 4.28% | US 2Y Yield: 4.18% (Curva 10Y-2Y: +10 pb)
- Oro: 2,842.50$ (+0.45%) | Petrolio WTI: 71.85$ (-0.72%)
- Bitcoin: 94,850$ (+2.15%)

Prompt per ChatGPT:
Analizza criticamente questo quadro di mercato cross-asset. Identifica le principali asimmetrie di rischio/rendimento e suggerisci considerazioni operative per allocazione tattica e coperture con opzioni/Covered Warrant.
`.trim();

    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3500);
    });
  };

  return (
    <div className="min-h-screen text-[#15231f] flex flex-col relative selection:bg-emerald-200">
      {/* Ambient background glows */}
      <div
        className="fixed top-1/4 -right-32 w-96 h-96 rounded-full bg-[#a6cab9]/25 blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 -left-32 w-96 h-96 rounded-full bg-[#e2c793]/20 blur-[100px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Top Header */}
      <Header
        activeApp={activeApp}
        setActiveApp={setActiveApp}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onCopyChatGpt={handleCopyChatGpt}
        copiedToast={copiedToast}
        freshnessText="Pronto · Dati aggiornati"
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {activeApp === 'market' ? (
          <MarketAnalyzerView
            markets={markets}
            regime={regime}
            sentiment={sentiment}
            onUpdateManualSentiment={handleUpdateManualSentiment}
            lastUpdated={lastUpdated}
          />
        ) : (
          <FinancialAnalyzerView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#15231f]/10 bg-[#f7f5ef]/80 py-6 text-center text-xs text-[#64716c] px-4">
        <p className="max-w-2xl mx-auto">
          <strong>Market & Financial Analyzer</strong> · Il progetto ha finalità di studio e analisi quantitativa.
          Non costituisce sollecitazione all'investimento o raccomandazione operativa. Verificare sempre i dati presso gli emittenti ufficiali.
        </p>
      </footer>
    </div>
  );
}

export default App;
