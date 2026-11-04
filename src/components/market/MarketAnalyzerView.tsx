import React, { useState } from 'react';
import { MarketItem, RegimeInfo, SentimentReport } from '../../types';
import { DailyBriefing } from './DailyBriefing';
import { WeeklyMacro } from './WeeklyMacro';
import { IndexBias } from './IndexBias';
import { SectorsView } from './SectorsView';
import { EarningsView } from './EarningsView';
import { BondsView } from './BondsView';
import { FedMonitor } from './FedMonitor';
import { YieldCurveView } from './YieldCurveView';
import { IndexScreener } from './IndexScreener';

interface MarketAnalyzerViewProps {
  markets: MarketItem[];
  regime: RegimeInfo;
  sentiment: SentimentReport;
  onUpdateManualSentiment: (score: number) => void;
  lastUpdated: string;
}

export const MarketAnalyzerView: React.FC<MarketAnalyzerViewProps> = ({
  markets,
  regime,
  sentiment,
  onUpdateManualSentiment,
  lastUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<string>('daily');

  const tabs = [
    { id: 'daily', num: '01', label: 'Oggi' },
    { id: 'weekly', num: '02', label: 'Weekly Macro' },
    { id: 'bias', num: '03', label: 'Index Bias' },
    { id: 'sectors', num: '04', label: 'Macrosettori S&P 500' },
    { id: 'earnings', num: '05', label: 'Utili societari' },
    { id: 'bonds', num: '06', label: 'Bond & tassi' },
    { id: 'fed', num: '07', label: 'Fed Rate Monitor' },
    { id: 'yield', num: '08', label: 'Yield curve' },
    { id: 'screener', num: '09', label: 'RSI componenti' },
  ];

  return (
    <div className="space-y-6">
      {/* 9 Workspace Tabs */}
      <nav
        className="sticky top-[4.2rem] z-20 flex items-center gap-1.5 overflow-x-auto py-2 px-1 bg-[#f7f5ef]/90 backdrop-blur-md border-b border-[#15231f]/10 no-scrollbar"
        aria-label="Sezioni Market Analyzer"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#15231f] text-white shadow-md'
                : 'text-[#64716c] hover:bg-white/60 hover:text-[#15231f]'
            }`}
          >
            <span className="serif-brand opacity-60 text-[10px]">{tab.num}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Panels */}
      <div>
        {activeTab === 'daily' && (
          <DailyBriefing
            markets={markets}
            regime={regime}
            sentiment={sentiment}
            onUpdateManualSentiment={onUpdateManualSentiment}
            lastUpdated={lastUpdated}
          />
        )}
        {activeTab === 'weekly' && <WeeklyMacro />}
        {activeTab === 'bias' && <IndexBias />}
        {activeTab === 'sectors' && <SectorsView />}
        {activeTab === 'earnings' && <EarningsView />}
        {activeTab === 'bonds' && <BondsView />}
        {activeTab === 'fed' && <FedMonitor />}
        {activeTab === 'yield' && <YieldCurveView />}
        {activeTab === 'screener' && <IndexScreener />}
      </div>
    </div>
  );
};
