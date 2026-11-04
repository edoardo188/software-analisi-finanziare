export type WarrantType = 'CALL' | 'PUT';

export interface CoveredWarrant {
  isin: string;
  issuer: string;
  warrant_type: WarrantType;
  underlying_name: string;
  underlying_isin?: string;
  underlying_ticker?: string;
  strike: number;
  expiry: string; // ISO date 'YYYY-MM-DD'
  ratio: number; // Parity divisor (e.g. 10, 100, 10000)
  currency: string;
  bid: number | null;
  ask: number | null;
  mid_price: number | null;
  spot_price: number | null;
  implied_volatility: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  omega: number | null;
}

export interface ScenarioResult {
  underlying_price: number;
  variation_pct: number;
  warrant_value: number;
  pnl: number;
  pnl_pct: number | null;
}

export interface TargetParameters {
  horizon_months: number;
  underlying_up_pct: number;
  minimum_cw_return_pct: number;
  maximum_cw_drawdown_pct: number;
  underlying_down_pct: number;
  risk_free_rate_pct: number;
}

export interface TargetProjection {
  product: CoveredWarrant;
  implied_volatility: number | null;
  upside_price: number;
  upside_return_pct: number;
  downside_price: number;
  downside_return_pct: number;
  downside_drawdown_pct: number;
  meets_target: boolean;
  method: string;
}

export interface RecentSearch {
  isin: string;
  underlying_name: string;
  issuer: string;
  provider_name: string;
  timestamp: number;
}

// Market Analyzer types
export interface MarketItem {
  id: string;
  name: string;
  symbol: string;
  group: 'Indici' | 'Valute' | 'Materie prime' | 'Rischio' | 'Crypto' | 'Tassi';
  kind: 'price' | 'yield';
  value: number;
  change_pct?: number;
  change_bps?: number;
  date: string;
  zscore: number;
  sparkline: number[]; // normalized 0..1
}

export interface RegimeInfo {
  name: string;
  tone: 'emerald' | 'amber' | 'rose' | 'sky';
  confidence: number;
  explanation: string;
  evidence: string[];
  scenarios: Array<{
    name: string;
    condition: string;
    weight: number;
  }>;
}

export interface SentimentComponent {
  name: string;
  value: string;
  score: number; // 0..100
  weight: number;
  reading: string;
  proxyNote?: string;
}

export interface SentimentReport {
  score: number;
  label: string;
  drivers: string;
  methodology: string;
  components: SentimentComponent[];
  cnnFearGreed?: number | null;
  cnnStatus?: string;
  manualScore?: number | null;
}

export interface SectorItem {
  symbol: string;
  name: string;
  price: number;
  daily_change_pct: number;
  weekly_change_pct: number;
  monthly_change_pct: number;
  ytd_change_pct: number;
  relative_strength: number; // vs S&P 500
  stage: 'Leading' | 'Weakening' | 'Lagging' | 'Improving';
}

export interface EarningsItem {
  ticker: string;
  company: string;
  date: string;
  time: 'BMO' | 'AMC' | 'During Market';
  epsEstimate: number;
  revenueEstimate: string; // e.g. "$12.4B"
  marketCap: number; // in billions
  sector: string;
  surprise?: number; // % if reported
}

export interface BondGovernmentItem {
  country: string;
  area: string;
  maturity: '2Y' | '10Y' | '30Y';
  symbol: string;
  yieldValue: number;
  daily_bps: number;
}

export interface BondCorporateItem {
  name: string;
  risk: 'Basso' | 'Medio' | 'Alto';
  rating: string;
  yieldValue: number;
  spread_bps: number;
  daily_bps: number;
}

export interface FedMeeting {
  meetingDate: string;
  probabilities: Record<string, number>; // e.g. "425-450": 85.4
  currentRate: string;
  mostProbableRange: string;
  probability: number;
}

export interface YieldCurvePoint {
  maturity: string;
  maturityMonths: number;
  currentYield: number;
  monthAgoYield: number;
  yearAgoYield: number;
}

export interface ScreenerStock {
  ticker: string;
  name: string;
  index: 'sp500' | 'nasdaq100' | 'dow30' | 'eurostoxx50';
  price: number;
  daily_change_pct: number;
  weekly_change_pct: number;
  rsi_14d: number;
  rsi_weekly: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  status: 'ok' | 'stale' | 'pending' | 'cached' | 'error';
}
