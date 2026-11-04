export interface IssuerQuoteResponse {
  success: boolean;
  source: string;
  instrument: any;
}

export interface ScannedArbitragePair {
  id: string;
  strategyType: 'TURBO_LONG_CW_PUT' | 'CW_CALL_TURBO_SHORT' | 'CW_CALL_CW_PUT' | 'TURBO_LONG_TURBO_SHORT';
  name: string;
  underlying: string;
  leg1: any;
  leg2: any;
  defaultUnitsLeg1: number;
  defaultUnitsLeg2: number;
  initialNetCost: number;
  convexityScore: number;
  rationale: string;
}

/**
 * Fetch a quote from the issuer proxy server by ISIN
 */
export async function fetchIssuerQuote(isin: string): Promise<any> {
  const cleanIsin = isin.toUpperCase().trim();
  try {
    const res = await fetch(`/api/issuers/quote/${cleanIsin}`);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data: IssuerQuoteResponse = await res.json();
    return data.instrument;
  } catch (err) {
    console.warn(`Fallback proxy fetch failed for ${cleanIsin}:`, err);
    return null;
  }
}

/**
 * Fetch scanned arbitrage opportunities across all 4 strategy types
 */
export async function fetchArbitrageOpportunities(): Promise<ScannedArbitragePair[]> {
  try {
    const res = await fetch('/api/arbitrage/opportunities');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.pairs || [];
  } catch (err) {
    console.warn('Failed to fetch arbitrage opportunities, using fallback:', err);
    return [];
  }
}
