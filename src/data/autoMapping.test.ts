import { resolveMetricMappings } from './autoMapping';
import { SALIENCE_ORDER } from '../face/types';

describe('resolveMetricMappings', () => {
  it('auto-maps metrics to features in salience order', () => {
    const metrics = ['cpu', 'memory', 'disk'];
    const result = resolveMetricMappings(metrics, []);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ metricName: 'cpu', feature: SALIENCE_ORDER[0] });
    expect(result[1]).toEqual({ metricName: 'memory', feature: SALIENCE_ORDER[1] });
    expect(result[2]).toEqual({ metricName: 'disk', feature: SALIENCE_ORDER[2] });
  });

  it('respects manual overrides', () => {
    const metrics = ['cpu', 'memory', 'disk'];
    const manual = [{ metricName: 'memory', feature: 'mouthCurvature' as const }];
    const result = resolveMetricMappings(metrics, manual);

    expect(result).toHaveLength(3);
    // Manual mapping comes first
    expect(result[0]).toEqual({ metricName: 'memory', feature: 'mouthCurvature' });
    // Remaining auto-mapped, skipping mouthCurvature and memory
    expect(result[1].metricName).toBe('cpu');
    expect(result[1].feature).toBe(SALIENCE_ORDER[1]); // faceHeight (since mouthCurvature is taken)
    expect(result[2].metricName).toBe('disk');
  });

  it('caps at 8 features', () => {
    const metrics = Array.from({ length: 12 }, (_, i) => `metric_${i}`);
    const result = resolveMetricMappings(metrics, []);

    expect(result).toHaveLength(8);
  });

  it('handles more features than metrics', () => {
    const metrics = ['cpu'];
    const result = resolveMetricMappings(metrics, []);

    expect(result).toHaveLength(1);
    expect(result[0].feature).toBe(SALIENCE_ORDER[0]);
  });

  it('ignores manual mappings for absent metrics', () => {
    const metrics = ['cpu', 'memory'];
    const manual = [{ metricName: 'nonexistent', feature: 'mouthCurvature' as const }];
    const result = resolveMetricMappings(metrics, manual);

    // Should auto-map without the manual override
    expect(result).toHaveLength(2);
    expect(result[0].metricName).toBe('cpu');
    expect(result[0].feature).toBe(SALIENCE_ORDER[0]);
  });

  it('returns empty for no metrics', () => {
    const result = resolveMetricMappings([], []);
    expect(result).toHaveLength(0);
  });
});
