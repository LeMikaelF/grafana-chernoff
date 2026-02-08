import { FaceParams } from './face/types';

export interface MetricMapping {
  metricName: string;
  feature: keyof FaceParams;
}

export interface ChernoffOptions {
  metricMappings: MetricMapping[];
  labelField: string;
  groupByField: string;
  aggregationWindowSeconds: number;
  zScoreClamp: number;
  showLabels: boolean;
  columns: number;
  maxFaces: number;
}

export const DEFAULT_OPTIONS: ChernoffOptions = {
  metricMappings: [],
  labelField: '',
  groupByField: '',
  aggregationWindowSeconds: 0,
  zScoreClamp: 3,
  showLabels: true,
  columns: 0,
  maxFaces: 0,
};

/** An entity (server, pod, etc.) with its raw metric values and computed face. */
export interface FaceEntity {
  label: string;
  group: string;
  metrics: Record<string, number>;
  zScores: Record<string, number>;
  params: FaceParams;
}

/** A group of entities with a label. */
export interface FaceGroup {
  groupLabel: string;
  entities: FaceEntity[];
}
