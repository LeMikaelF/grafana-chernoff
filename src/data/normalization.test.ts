import { computeStats, normalizeValue, normalizeEntities } from './normalization';

describe('computeStats', () => {
  it('returns zeros for empty array', () => {
    const stats = computeStats([]);
    expect(stats.mean).toBe(0);
    expect(stats.stddev).toBe(0);
  });

  it('returns value as mean with zero stddev for single value', () => {
    const stats = computeStats([42]);
    expect(stats.mean).toBe(42);
    expect(stats.stddev).toBe(0);
  });

  it('computes correct stats for simple dataset', () => {
    const stats = computeStats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(stats.mean).toBe(5);
    expect(stats.stddev).toBeCloseTo(2, 0);
    expect(stats.min).toBe(2);
    expect(stats.max).toBe(9);
  });

  it('returns zero stddev for identical values', () => {
    const stats = computeStats([5, 5, 5, 5]);
    expect(stats.mean).toBe(5);
    expect(stats.stddev).toBe(0);
  });
});

describe('normalizeValue', () => {
  it('returns 0.5 when stddev is 0', () => {
    const stats = { mean: 10, stddev: 0, min: 10, max: 10 };
    const result = normalizeValue(10, stats, 3);
    expect(result.normalized).toBe(0.5);
    expect(result.zScore).toBe(0);
  });

  it('returns 0.5 for mean value', () => {
    const stats = { mean: 50, stddev: 10, min: 20, max: 80 };
    const result = normalizeValue(50, stats, 3);
    expect(result.normalized).toBe(0.5);
    expect(result.zScore).toBe(0);
  });

  it('returns 1 for value at +clamp SDs', () => {
    const stats = { mean: 50, stddev: 10, min: 20, max: 80 };
    const result = normalizeValue(80, stats, 3);
    expect(result.normalized).toBe(1);
    expect(result.zScore).toBe(3);
  });

  it('returns 0 for value at -clamp SDs', () => {
    const stats = { mean: 50, stddev: 10, min: 20, max: 80 };
    const result = normalizeValue(20, stats, 3);
    expect(result.normalized).toBe(0);
    expect(result.zScore).toBe(-3);
  });

  it('clamps extreme values', () => {
    const stats = { mean: 50, stddev: 10, min: 0, max: 100 };
    const result = normalizeValue(100, stats, 3);
    expect(result.normalized).toBe(1);
    expect(result.zScore).toBe(5); // raw z-score not clamped
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

    // Mean=50, lowest should be below 0.5, highest above
    expect(results[0].normalized.cpu).toBeLessThan(0.5);
    expect(results[1].normalized.cpu).toBe(0.5);
    expect(results[2].normalized.cpu).toBeGreaterThan(0.5);
  });
});
