export interface MetricStats {
  mean: number;
  stddev: number;
  min: number;
  max: number;
}

/** Compute mean and standard deviation for a set of values. */
export function computeStats(values: number[]): MetricStats {
  if (values.length === 0) {
    return { mean: 0, stddev: 0, min: 0, max: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;

  if (values.length === 1) {
    return { mean, stddev: 0, min, max };
  }

  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);

  return { mean, stddev, min, max };
}

/**
 * Normalize a value to [0, 1] using z-score normalization.
 *
 * - z = (value - mean) / stddev
 * - Clamped to [-clamp, +clamp] standard deviations
 * - Then mapped linearly to [0, 1]: -clamp → 0, 0 → 0.5, +clamp → 1
 *
 * Edge cases:
 * - stddev=0 (all identical) → 0.5 (neutral)
 * - 1 entity → spread evenly using min-max
 */
export function normalizeValue(
  value: number,
  stats: MetricStats,
  clamp: number
): { normalized: number; zScore: number } {
  // All identical values → neutral
  if (stats.stddev === 0) {
    return { normalized: 0.5, zScore: 0 };
  }

  const zScore = (value - stats.mean) / stats.stddev;
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
  // Compute stats for each metric across all entities
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
