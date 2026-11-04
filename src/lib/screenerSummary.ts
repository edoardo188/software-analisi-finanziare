/**
 * Shared calculations for configurable index summary threshold
 * Matches the logic verified in market-analyzer/tests/test_screener_summary.js
 */
export function summarizeScreenerThreshold<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
  threshold: number | null | undefined
): {
  total: number;
  available: number;
  below: number | null;
  percentage: number | null;
} {
  const available = rows.filter(
    (row) => row.status === 'ok' && typeof row[key] === 'number' && Number.isFinite(row[key])
  );
  const validThreshold = typeof threshold === 'number' && Number.isFinite(threshold);
  const below = validThreshold
    ? available.filter((row) => (row[key] as number) < threshold).length
    : null;

  return {
    total: rows.length,
    available: available.length,
    below,
    percentage:
      validThreshold && available.length && below !== null ? (below / available.length) * 100 : null,
  };
}
