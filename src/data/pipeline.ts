import { DataFrame } from '@grafana/data';
import { ChernoffOptions, FaceEntity, FaceGroup } from '../types';
import { FaceParams, NEUTRAL_FACE } from '../face/types';
import { extractEntities } from './aggregation';
import { normalizeEntities } from './normalization';
import { resolveMetricMappings } from './autoMapping';
import { groupEntities } from './grouping';

/**
 * Main data pipeline: DataFrame[] → FaceGroup[]
 *
 * Steps:
 * 1. Extract raw entities from DataFrames (table or multi-series)
 * 2. Resolve metric-to-feature mappings (auto or manual)
 * 3. Normalize metrics across the population (z-score)
 * 4. Map normalized values to FaceParams
 * 5. Group and sort entities
 */
export function processData(
  frames: DataFrame[],
  options: ChernoffOptions
): FaceGroup[] {
  // 1. Extract raw entities
  const rawEntities = extractEntities(
    frames,
    options.labelField,
    options.groupByField,
    options.aggregationWindowSeconds
  );

  if (rawEntities.length === 0) {
    return [];
  }

  // Limit entities if maxFaces is set
  const limited = options.maxFaces > 0
    ? rawEntities.slice(0, options.maxFaces)
    : rawEntities;

  // 2. Discover all metric names across entities
  const allMetrics = new Set<string>();
  for (const entity of limited) {
    for (const key of Object.keys(entity.metrics)) {
      allMetrics.add(key);
    }
  }
  const metricNames = Array.from(allMetrics);

  // 3. Resolve metric mappings
  const mappings = resolveMetricMappings(metricNames, options.metricMappings);

  // 4. Normalize
  const normalized = normalizeEntities(limited, metricNames, options.zScoreClamp);

  // 5. Build FaceEntities
  const faceEntities: FaceEntity[] = limited.map((raw, i) => {
    const params: FaceParams = { ...NEUTRAL_FACE };

    for (const mapping of mappings) {
      const normValue = normalized[i].normalized[mapping.metricName];
      if (normValue !== undefined) {
        params[mapping.feature] = normValue;
      }
    }

    // Collect z-scores for mapped metrics only
    const zScores: Record<string, number> = {};
    for (const mapping of mappings) {
      const z = normalized[i].zScores[mapping.metricName];
      if (z !== undefined) {
        zScores[mapping.metricName] = z;
      }
    }

    return {
      label: raw.label,
      group: raw.group,
      metrics: raw.metrics,
      zScores,
      params,
    };
  });

  // 6. Group and sort
  return groupEntities(faceEntities);
}
