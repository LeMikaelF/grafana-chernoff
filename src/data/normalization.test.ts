import { computeStats, normalizeValue, normalizeEntities } from './normalization';

describe('computeStats', () => {
  it('returns zeros for empty array', () => {
    const stats = computeStats([]);
    expect(stats.median).toBe(0);
    expect(stats.iqr).toBe(0);
  });

  it('returns value as median with zero iqr for single value', () => {
    const stats = computeStats([42]);
    expect(stats.median).toBe(42);
    expect(stats.iqr).toBe(0);
  });

  it('computes correct median for odd-length dataset', () => {
    const stats = computeStats([1, 3, 5, 7, 9]);
    expect(stats.median).toBe(5);
  });

  it('computes correct median for even-length dataset', () => {
    const stats = computeStats([1, 3, 5, 7]);
    expect(stats.median).toBe(4);
  });

  it('computes correct IQR', () => {
    // Sorted: [2, 4, 4, 4, 5, 5, 7, 9]
    // Q1 = percentile(0.25) = index 1.75 → 4
    // Q3 = percentile(0.75) = index 5.25 → 5.5
    // IQR = 1.5
    const stats = computeStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.iqr).toBeCloseTo(1.5, 1);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
  });

  it('returns zero iqr for identical values', () => {
    const stats = computeStats([5, 5, 5, 5]);
    expect(stats.median).toBe(5);
    expect(stats.iqr).toBe(0);
  });

  it('is not affected by extreme outliers', () => {
    // Normal values: 1-10, with one outlier at 1000
    const normal = computeStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const withOutlier = computeStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 1000]);
    // Median and IQR should be very similar despite the outlier
    expect(withOutlier.median).toBeCloseTo(normal.median, 0);
    expect(withOutlier.iqr).toBeCloseTo(normal.iqr, 0);
  });
});

describe('normalizeValue', () => {
  it('returns 0.5 when iqr is 0', () => {
    const stats = { median: 10, iqr: 0, min: 10, max: 10 };
    const result = normalizeValue(10, stats, 3);
    expect(result.normalized).toBe(0.5);
    expect(result.zScore).toBe(0);
  });

  it('returns 0.5 for median value', () => {
    const stats = { median: 50, iqr: 10, min: 20, max: 80 };
    const result = normalizeValue(50, stats, 3);
    expect(result.normalized).toBe(0.5);
    expect(result.zScore).toBe(0);
  });

  it('returns >0.5 for above-median value', () => {
    const stats = { median: 50, iqr: 10, min: 20, max: 80 };
    const result = normalizeValue(60, stats, 3);
    expect(result.normalized).toBeGreaterThan(0.5);
    expect(result.zScore).toBe(1);
  });

  it('returns <0.5 for below-median value', () => {
    const stats = { median: 50, iqr: 10, min: 20, max: 80 };
    const result = normalizeValue(40, stats, 3);
    expect(result.normalized).toBeLessThan(0.5);
    expect(result.zScore).toBe(-1);
  });

  it('clamps extreme values', () => {
    const stats = { median: 50, iqr: 10, min: 0, max: 100 };
    const result = normalizeValue(100, stats, 3);
    expect(result.normalized).toBe(1);
  });
});

describe('normalizeEntities', () => {
  it('normalizes all identical values to 0.5', () => {
    const entities = [
      { metrics: { cpu: 50 } },
      { metrics: { cpu: 50 } },
      { metrics: { cpu: 50 } },
    ];
    const results = normalizeEntities(entities, ['cpu'], 3);
    results.forEach((r) => {
      expect(r.normalized.cpu).toBe(0.5);
      expect(r.zScores.cpu).toBe(0);
    });
  });

  it('normalizes missing metrics to 0.5', () => {
    const entities: Array<{ metrics: Record<string, number> }> = [
      { metrics: { cpu: 50 } },
      { metrics: {} },
    ];
    const results = normalizeEntities(entities, ['cpu'], 3);
    expect(results[1].normalized.cpu).toBe(0.5);
  });

  it('spreads varied values across 0-1 range', () => {
    const entities = [
      { metrics: { cpu: 20 } },
      { metrics: { cpu: 50 } },
      { metrics: { cpu: 80 } },
    ];
    const results = normalizeEntities(entities, ['cpu'], 3);

    expect(results[0].normalized.cpu).toBeLessThan(0.5);
    expect(results[1].normalized.cpu).toBe(0.5);
    expect(results[2].normalized.cpu).toBeGreaterThan(0.5);
  });

  it('spreads normal values even with extreme outlier', () => {
    // This is the key test: with mean+stddev, values 1-10 would all
    // collapse to ~0.5 because the outlier dominates stddev.
    // With median+IQR, they should still spread across a real range.
    const entities = [
      { metrics: { v: 1 } },
      { metrics: { v: 3 } },
      { metrics: { v: 5 } },
      { metrics: { v: 7 } },
      { metrics: { v: 9 } },
      { metrics: { v: 1000 } }, // extreme outlier
    ];
    const results = normalizeEntities(entities, ['v'], 3);

    const normalValues = results.slice(0, 5).map((r) => r.normalized.v);
    const range = Math.max(...normalValues) - Math.min(...normalValues);
    // Normal values should span a meaningful range (not compressed to ~0)
    expect(range).toBeGreaterThan(0.2);
    // Outlier should be clamped to 1
    expect(results[5].normalized.v).toBe(1);
  });
});
