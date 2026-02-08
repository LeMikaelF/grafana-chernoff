export interface MetricStats {
  median: number;
  iqr: number;
  min: number;
  max: number;
}

/** Compute the value at a given percentile (0-1) from a sorted array. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  if (sorted.length === 1) {
    return sorted[0];
  }
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

/**
 * Compute robust statistics: median and IQR (interquartile range).
 * Unlike mean/stddev, these are resistant to extreme outliers.
 */
export function computeStats(values: number[]): MetricStats {
  if (values.length === 0) {
    return { median: 0, iqr: 0, min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const median = percentile(sorted, 0.5);

  if (values.length === 1) {
    return { median, iqr: 0, min, max };
  }

  const q1 = percentile(sorted, 0.25);
  const q3 = percentile(sorted, 0.75);
  const iqr = q3 - q1;

  return { median, iqr, min, max };
}

/**
 * Normalize a value to [0, 1] using robust z-score normalization.
 *
 * - robustZ = (value - median) / IQR
 * - Clamped to [-clamp, +clamp]
 * - Then mapped linearly to [0, 1]: -clamp → 0, 0 → 0.5, +clamp → 1
 *
 * Using median + IQR instead of mean + stddev prevents extreme outliers
 * from compressing all normal values into a narrow band.
 *
 * Edge cases:
 * - IQR=0 (all identical or <=2 entities) → 0.5 (neutral)
 */
export function normalizeValue(
  value: number,
  stats: MetricStats,
  clamp: number
): { normalized: number; zScore: number } {
  if (stats.iqr === 0) {
    return { normalized: 0.5, zScore: 0 };
  }

  const zScore = (value - stats.median) / stats.iqr;
  const clamped = Math.max(-clamp, Math.min(clamp, zScore));
  const normalized = (clamped + clamp) / (2 * clamp);

  return { normalized, zScore };
}

/**
 * Normalize all entities' metrics across the population.
 * Returns normalized values and z-scores per metric per entity.
 */
export function normalizeEntities(
  entities: Array<{ metrics: Record<string, number> }>,
  metricNames: string[],
  clamp: number
): Array<{ normalized: Record<string, number>; zScores: Record<string, number> }> {
  const stats: Record<string, MetricStats> = {};
  for (const metric of metricNames) {
    const values = entities.map((e) => e.metrics[metric]).filter((v) => v !== undefined && !isNaN(v));
    stats[metric] = computeStats(values);
  }

  return entities.map((entity) => {
    const normalized: Record<string, number> = {};
    const zScores: Record<string, number> = {};

    for (const metric of metricNames) {
      const value = entity.metrics[metric];
      if (value === undefined || isNaN(value)) {
        normalized[metric] = 0.5;
        zScores[metric] = 0;
      } else {
        const result = normalizeValue(value, stats[metric], clamp);
        normalized[metric] = result.normalized;
        zScores[metric] = result.zScore;
      }
    }

    return { normalized, zScores };
  });
}
