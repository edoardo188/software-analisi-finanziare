import { CoveredWarrant, ScenarioResult, TargetParameters, TargetProjection, WarrantType } from '../types';

/**
 * Checks if warrant is a Put
 */
export function isPut(warrantType: WarrantType | string | null | undefined): boolean {
  return Boolean(warrantType && warrantType.toUpperCase().includes('PUT'));
}

/**
 * Absolute spread between bid and ask
 */
export function spreadAbs(bid: number | null, ask: number | null): number | null {
  if (bid === null || ask === null) return null;
  return ask - bid;
}

/**
 * Relative spread as percentage of ask
 */
export function spreadPct(bid: number | null, ask: number | null): number | null {
  if (bid === null || ask === null || ask === 0) return null;
  return (ask - bid) / ask;
}

/**
 * Days remaining to expiration date
 */
export function timeToMaturityDays(expiryStr: string | null | undefined): number | null {
  if (!expiryStr) return null;
  const expiry = new Date(expiryStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Intrinsic value of a Covered Warrant
 * Payoff Call = max(0, spot - strike) / ratio
 * Payoff Put = max(0, strike - spot) / ratio
 */
export function intrinsicValue(
  spot: number | null,
  strike: number | null,
  ratio: number | null,
  warrantType: WarrantType | string | null | undefined
): number | null {
  if (spot === null || strike === null || ratio === null || ratio === 0 || !warrantType) {
    return null;
  }
  if (isPut(warrantType)) {
    return Math.max(0, strike - spot) / ratio;
  }
  return Math.max(0, spot - strike) / ratio;
}

/**
 * Time value = purchase price - intrinsic value
 */
export function timeValue(price: number | null, intrinsic: number | null): number | null {
  if (price === null || intrinsic === null) return null;
  return price - intrinsic;
}

/**
 * Distance from strike in percentage: (spot - strike) / strike
 */
export function distanceFromStrikePct(spot: number | null, strike: number | null): number | null {
  if (spot === null || strike === null || strike === 0) return null;
  return (spot - strike) / strike;
}

/**
 * Moneyness classification: Deep ITM, ITM, ATM, OTM, Deep OTM
 */
export function moneynessClassification(
  spot: number | null,
  strike: number | null,
  warrantType: WarrantType | string | null | undefined
): string {
  let distance = distanceFromStrikePct(spot, strike);
  if (distance === null || !warrantType) return 'N/D';

  if (isPut(warrantType)) {
    distance = -distance;
  }

  if (distance >= 0.20) return 'Deep ITM';
  if (distance >= 0.05) return 'ITM';
  if (distance > -0.05) return 'ATM';
  if (distance > -0.20) return 'OTM';
  return 'Deep OTM';
}

/**
 * Effective leverage: Spot / (Price * Ratio)
 */
export function effectiveLeverage(
  spot: number | null,
  price: number | null,
  ratio: number | null
): number | null {
  if (spot === null || price === null || ratio === null || price === 0 || ratio === 0) {
    return null;
  }
  return spot / (price * ratio);
}

/**
 * Elasticity estimated from delta: Delta * Spot / (Price * Ratio)
 */
export function elasticityFromDelta(
  spot: number | null,
  price: number | null,
  ratio: number | null,
  delta: number | null
): number | null {
  if (delta === null || spot === null || price === null || ratio === null) return null;
  if (price === 0 || ratio === 0) return null;
  return (delta * spot) / (price * ratio);
}

/**
 * Daily theta cost percentage: Theta / Price
 */
export function thetaCostPct(price: number | null, theta: number | null): number | null {
  if (theta === null || price === null || price === 0) return null;
  return theta / price;
}

/**
 * Maximum loss for buyer = purchase price
 */
export function maxLoss(price: number | null): number | null {
  return price;
}

/**
 * Personal Break-even for Call: Strike + Purchase_Price * Ratio
 */
export function callBreakEven(strike: number, purchasePrice: number, ratio: number): number {
  return strike + purchasePrice * ratio;
}

/**
 * Personal Break-even for Put: Strike - Purchase_Price * Ratio
 */
export function putBreakEven(strike: number, purchasePrice: number, ratio: number): number {
  return strike - purchasePrice * ratio;
}

/**
 * Calculate expiry scenarios for a given set of spot variations (e.g. [-0.03, 0.03])
 */
export function expiryScenarios(
  currentUnderlying: number,
  strike: number,
  ratio: number,
  purchasePrice: number,
  warrantType: WarrantType | string,
  variations: number[]
): ScenarioResult[] {
  return variations.map((variation) => {
    const underlyingPrice = currentUnderlying * (1 + variation);
    const warrantVal = intrinsicValue(underlyingPrice, strike, ratio, warrantType) ?? 0;
    const pnl = warrantVal - purchasePrice;
    const pnlPct = purchasePrice > 0 ? pnl / purchasePrice : null;

    return {
      underlying_price: underlyingPrice,
      variation_pct: variation,
      warrant_value: warrantVal,
      pnl,
      pnl_pct: pnlPct,
    };
  });
}

/**
 * Error function approximation for Black-Scholes standard normal CDF
 */
function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Black-Scholes option price for plain vanilla European options
 */
export function blackScholesPrice(
  spot: number,
  strike: number,
  timeYears: number,
  volatility: number,
  riskFreeRate: number,
  optionType: string
): number {
  if (spot <= 0 || strike <= 0) {
    throw new Error('Spot e strike devono essere positivi.');
  }

  const put = isPut(optionType);
  if (timeYears <= 0) {
    return put ? Math.max(strike - spot, 0) : Math.max(spot - strike, 0);
  }

  if (volatility <= 0) {
    const discountedStrike = strike * Math.exp(-riskFreeRate * timeYears);
    return put ? Math.max(discountedStrike - spot, 0) : Math.max(spot - discountedStrike, 0);
  }

  const sigmaSqrtT = volatility * Math.sqrt(timeYears);
  const d1 =
    (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeYears) /
    sigmaSqrtT;
  const d2 = d1 - sigmaSqrtT;
  const discountedStrike = strike * Math.exp(-riskFreeRate * timeYears);

  if (put) {
    return discountedStrike * normalCdf(-d2) - spot * normalCdf(-d1);
  }
  return spot * normalCdf(d1) - discountedStrike * normalCdf(d2);
}

/**
 * Bisection solver for Black-Scholes implied volatility
 */
export function impliedVolatility(
  marketOptionValue: number,
  spot: number,
  strike: number,
  timeYears: number,
  riskFreeRate: number,
  optionType: string
): number | null {
  if (marketOptionValue <= 0 || timeYears <= 0) return null;

  let low = 0.0001;
  let high = 5.0;

  try {
    const lowPrice = blackScholesPrice(spot, strike, timeYears, low, riskFreeRate, optionType);
    const highPrice = blackScholesPrice(spot, strike, timeYears, high, riskFreeRate, optionType);
    const tolerance = Math.max(1e-7, marketOptionValue * 1e-6);

    if (marketOptionValue < lowPrice - tolerance || marketOptionValue > highPrice) {
      return null;
    }

    for (let i = 0; i < 100; i++) {
      const middle = (low + high) / 2;
      const modelPrice = blackScholesPrice(spot, strike, timeYears, middle, riskFreeRate, optionType);
      if (Math.abs(modelPrice - marketOptionValue) <= tolerance) {
        return middle;
      }
      if (modelPrice < marketOptionValue) {
        low = middle;
      } else {
        high = middle;
      }
    }
    return (low + high) / 2;
  } catch {
    return null;
  }
}

/**
 * Project Covered Warrant target return & drawdown using Black-Scholes or Omega fallback
 */
export function projectTarget(
  product: CoveredWarrant,
  parameters: TargetParameters,
  asOfDate: Date = new Date()
): TargetProjection | null {
  const spot = product.spot_price;
  const strike = product.strike;
  const ratio = product.ratio;
  const ask = product.ask;
  const warrantType = product.warrant_type;

  if (
    spot === null ||
    strike === null ||
    ratio === null ||
    ratio <= 0 ||
    spot <= 0 ||
    strike <= 0 ||
    ask === null ||
    ask <= 0 ||
    !product.expiry
  ) {
    return null;
  }

  const expiry = new Date(product.expiry);
  const daysToExpiry = Math.ceil((expiry.getTime() - asOfDate.getTime()) / (1000 * 60 * 60 * 24));
  const horizonDays = Math.round((parameters.horizon_months * 365.25) / 12);

  if (daysToExpiry <= horizonDays) {
    return null;
  }

  const bid = product.bid ?? ask;
  const mid = (bid + ask) / 2;
  const marketOptionVal = mid * ratio;
  const t0Years = daysToExpiry / 365.25;
  const tRemainingYears = (daysToExpiry - horizonDays) / 365.25;
  const r = parameters.risk_free_rate_pct / 100;

  // Expected spot moves
  const upsideSpot = spot * (1 + parameters.underlying_up_pct / 100);
  const downsideSpot = spot * (1 - parameters.underlying_down_pct / 100);

  // Attempt Black-Scholes implied vol
  const iv = impliedVolatility(marketOptionVal, spot, strike, t0Years, r, warrantType);

  let upsidePrice: number;
  let downsidePrice: number;
  let method = 'Black-Scholes';

  if (iv !== null && iv > 0) {
    const rawUpside = blackScholesPrice(upsideSpot, strike, tRemainingYears, iv, r, warrantType);
    const rawDownside = blackScholesPrice(downsideSpot, strike, tRemainingYears, iv, r, warrantType);
    upsidePrice = rawUpside / ratio;
    downsidePrice = rawDownside / ratio;
  } else if (product.omega && product.omega > 0) {
    // Fallback using omega
    method = 'Stima Omega';
    const upReturn = product.omega * (parameters.underlying_up_pct / 100);
    const downReturn = -product.omega * (parameters.underlying_down_pct / 100);
    upsidePrice = Math.max(0, ask * (1 + upReturn));
    downsidePrice = Math.max(0, ask * (1 + downReturn));
  } else {
    // Fallback intrinsic value at target date
    method = 'Valore intrinseco';
    upsidePrice = (intrinsicValue(upsideSpot, strike, ratio, warrantType) ?? 0);
    downsidePrice = (intrinsicValue(downsideSpot, strike, ratio, warrantType) ?? 0);
  }

  const upsideReturnPct = ((upsidePrice - ask) / ask) * 100;
  const downsideReturnPct = ((downsidePrice - ask) / ask) * 100;
  const downsideDrawdownPct = Math.max(0, -downsideReturnPct);

  const meetsTarget =
    upsideReturnPct >= parameters.minimum_cw_return_pct &&
    downsideDrawdownPct <= parameters.maximum_cw_drawdown_pct;

  return {
    product,
    implied_volatility: iv,
    upside_price: upsidePrice,
    upside_return_pct: upsideReturnPct,
    downside_price: downsidePrice,
    downside_return_pct: downsideReturnPct,
    downside_drawdown_pct: downsideDrawdownPct,
    meets_target: meetsTarget,
    method,
  };
}

/**
 * Filter and rank Call target candidates and evaluate Put coverage
 */
export function rankTargetCandidates(
  products: CoveredWarrant[],
  parameters: TargetParameters,
  limit = 50
): { candidates: TargetProjection[]; coverageProjections: TargetProjection[] } {
  const calls = products.filter((p) => !isPut(p.warrant_type));
  const puts = products.filter((p) => isPut(p.warrant_type));

  const validCallProjections: TargetProjection[] = [];
  for (const call of calls) {
    const proj = projectTarget(call, parameters);
    if (proj && proj.meets_target) {
      validCallProjections.push(proj);
    }
  }

  // Sort calls descending by upside return %
  validCallProjections.sort((a, b) => b.upside_return_pct - a.upside_return_pct);
  const candidates = validCallProjections.slice(0, limit);

  // Evaluate Put protections
  const coverageProjections: TargetProjection[] = [];
  for (const put of puts) {
    const proj = projectTarget(put, parameters);
    if (proj) {
      coverageProjections.push(proj);
    }
  }
  // Sort puts descending by downside return % (yield if underlying drops)
  coverageProjections.sort((a, b) => b.downside_return_pct - a.downside_return_pct);

  return { candidates, coverageProjections };
}

/**
 * Auto-detect provider name from ISIN prefix
 */
export function detectIssuerByIsin(isin: string): { issuer: string; isRecognized: boolean } {
  const clean = (isin || '').trim().toUpperCase();
  if (clean.startsWith('NLBNP')) {
    return { issuer: 'BNP Paribas', isRecognized: true };
  }
  if (clean.startsWith('DE000U')) {
    return { issuer: 'UniCredit OneMarkets', isRecognized: true };
  }
  if (clean.startsWith('DE000V') || clean.startsWith('DE000B')) {
    return { issuer: 'Vontobel', isRecognized: true };
  }
  if (clean.startsWith('DE000F') || clean.startsWith('DE000S')) {
    return { issuer: 'Société Générale', isRecognized: true };
  }
  return { issuer: 'Provider automatico', isRecognized: false };
}
