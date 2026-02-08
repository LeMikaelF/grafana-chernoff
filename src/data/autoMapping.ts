import { FaceParams, SALIENCE_ORDER } from '../face/types';
import { MAX_FEATURES } from '../face/constants';
import { MetricMapping } from '../types';

/**
 * Resolve metric-to-feature mappings.
 *
 * Strategy:
 * 1. Apply manual overrides first (user-specified mappings)
 * 2. Auto-map remaining metrics to remaining features in salience order
 * 3. Most important metrics (first in list) get most salient features
 * 4. Cap at MAX_FEATURES (8)
 *
 * @param metricNames - Available metric names (in order of importance)
 * @param manualMappings - User-specified manual overrides
 * @returns Final resolved mappings
 */
export function resolveMetricMappings(
  metricNames: string[],
  manualMappings: MetricMapping[]
): MetricMapping[] {
  const result: MetricMapping[] = [];

  // Track which features and metrics are already assigned
  const usedFeatures = new Set<keyof FaceParams>();
  const usedMetrics = new Set<string>();

  // Apply manual overrides first
  for (const manual of manualMappings) {
    if (
      metricNames.includes(manual.metricName) &&
      !usedFeatures.has(manual.feature) &&
      !usedMetrics.has(manual.metricName)
    ) {
      result.push({ ...manual });
      usedFeatures.add(manual.feature);
      usedMetrics.add(manual.metricName);
    }
  }

  // Auto-map remaining metrics to remaining features by salience
  const remainingFeatures = SALIENCE_ORDER.filter((f) => !usedFeatures.has(f));
  const remainingMetrics = metricNames.filter((m) => !usedMetrics.has(m));

  const autoCount = Math.min(
    remainingFeatures.length,
    remainingMetrics.length,
    MAX_FEATURES - result.length
  );

  for (let i = 0; i < autoCount; i++) {
    result.push({
      metricName: remainingMetrics[i],
      feature: remainingFeatures[i],
    });
  }

  return result;
}
