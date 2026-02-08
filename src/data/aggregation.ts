import { DataFrame, FieldType } from '@grafana/data';

export interface RawEntity {
  label: string;
  group: string;
  metrics: Record<string, number>;
}

/**
 * Detect whether DataFrames are in table format or multi-series format.
 *
 * Table format: Single DataFrame with columns for label, group, and metrics.
 * Multi-series: Multiple DataFrames, each with time+value, labels in frame labels.
 */
function isTableFormat(frames: DataFrame[]): boolean {
  if (frames.length === 0) {
    return true;
  }

  // Table format if there are string fields (label columns) among non-time fields
  const firstFrame = frames[0];
  const hasStringField = firstFrame.fields.some((f) => f.type === FieldType.string);
  return hasStringField;
}

/**
 * Average numeric values over the last `windowSeconds` of a time-series field.
 * If windowSeconds <= 0, returns the last value.
 */
function aggregateField(
  timeValues: number[] | undefined,
  dataValues: number[],
  windowSeconds: number
): number {
  if (dataValues.length === 0) {
    return 0;
  }

  if (windowSeconds <= 0 || !timeValues || timeValues.length === 0) {
    // Last value
    return dataValues[dataValues.length - 1];
  }

  const latestTime = timeValues[timeValues.length - 1];
  const windowStart = latestTime - windowSeconds * 1000; // ms

  let sum = 0;
  let count = 0;
  for (let i = 0; i < dataValues.length; i++) {
    if (timeValues[i] >= windowStart) {
      sum += dataValues[i];
      count++;
    }
  }

  return count > 0 ? sum / count : dataValues[dataValues.length - 1];
}

/**
 * Extract entities from table-format DataFrames.
 * Each row is an entity. Columns are metrics.
 */
function extractFromTable(
  frames: DataFrame[],
  labelField: string,
  groupByField: string,
  _windowSeconds: number
): RawEntity[] {
  const entities: RawEntity[] = [];

  for (const frame of frames) {
    const labelCol = frame.fields.find((f) => f.name === labelField);
    const groupCol = groupByField ? frame.fields.find((f) => f.name === groupByField) : undefined;
    const numericFields = frame.fields.filter(
      (f) => f.type === FieldType.number && f.name !== labelField && f.name !== groupByField
    );

    if (!labelCol) {
      continue;
    }

    const rowCount = frame.length;
    for (let row = 0; row < rowCount; row++) {
      const label = String(labelCol.values[row] ?? `entity-${row}`);
      const group = groupCol ? String(groupCol.values[row] ?? '') : '';
      const metrics: Record<string, number> = {};

      for (const field of numericFields) {
        const val = field.values[row];
        if (typeof val === 'number' && !isNaN(val)) {
          metrics[field.name] = val;
        }
      }

      entities.push({ label, group, metrics });
    }
  }

  return entities;
}

/**
 * Extract entities from multi-series DataFrames.
 * Each DataFrame is one metric for one entity. Labels come from frame labels.
 */
function extractFromMultiSeries(
  frames: DataFrame[],
  labelField: string,
  groupByField: string,
  windowSeconds: number
): RawEntity[] {
  // Build a map: entityLabel → { group, metrics }
  const entityMap = new Map<string, { group: string; metrics: Record<string, number> }>();

  for (const frame of frames) {
    const labels = frame.meta?.custom?.labels ?? frame.fields[0]?.labels ?? {};

    // Try to get label from frame labels, display name, or frame name
    let entityLabel = '';
    if (labelField && labels[labelField]) {
      entityLabel = labels[labelField];
    } else if (frame.name) {
      entityLabel = frame.name;
    } else {
      // Try first label value
      const labelValues = Object.values(labels);
      if (labelValues.length > 0) {
        entityLabel = String(labelValues[0]);
      }
    }

    if (!entityLabel) {
      continue;
    }

    const group = groupByField && labels[groupByField] ? labels[groupByField] : '';

    if (!entityMap.has(entityLabel)) {
      entityMap.set(entityLabel, { group, metrics: {} });
    }

    const entry = entityMap.get(entityLabel)!;
    if (group && !entry.group) {
      entry.group = group;
    }

    // Find time and value fields
    const timeField = frame.fields.find((f) => f.type === FieldType.time);
    const valueFields = frame.fields.filter((f) => f.type === FieldType.number);

    for (const vf of valueFields) {
      const metricName = vf.name === 'Value' ? (frame.name || vf.name) : vf.name;
      const timeValues = timeField?.values as number[] | undefined;
      const dataValues = vf.values as number[];
      entry.metrics[metricName] = aggregateField(timeValues, dataValues, windowSeconds);
    }
  }

  return Array.from(entityMap.entries()).map(([label, data]) => ({
    label,
    group: data.group,
    metrics: data.metrics,
  }));
}

/**
 * Extract raw entities from Grafana DataFrames.
 * Auto-detects table vs multi-series format.
 */
export function extractEntities(
  frames: DataFrame[],
  labelField: string,
  groupByField: string,
  windowSeconds: number
): RawEntity[] {
  if (frames.length === 0) {
    return [];
  }

  if (isTableFormat(frames)) {
    return extractFromTable(frames, labelField, groupByField, windowSeconds);
  }

  return extractFromMultiSeries(frames, labelField, groupByField, windowSeconds);
}
