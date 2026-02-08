import { FaceParams } from './types';

export interface FeatureInfo {
  key: keyof FaceParams;
  label: string;
  salienceRank: number;
  description: string;
}

/** Feature metadata ordered by salience rank (1 = most salient). */
export const FEATURES: readonly FeatureInfo[] = [
  { key: 'mouthCurvature', label: 'Mouth curvature', salienceRank: 1, description: 'Smile/frown' },
  { key: 'faceHeight', label: 'Face height', salienceRank: 2, description: 'Overall face size' },
  { key: 'eyeSize', label: 'Eye size', salienceRank: 3, description: 'Eye radius' },
  { key: 'eyebrowLength', label: 'Eyebrow length', salienceRank: 4, description: 'Eyebrow width' },
  { key: 'noseLength', label: 'Nose length', salienceRank: 5, description: 'Nose vertical extent' },
  { key: 'mouthWidth', label: 'Mouth width', salienceRank: 6, description: 'Mouth horizontal extent' },
  { key: 'faceWidth', label: 'Face width', salienceRank: 7, description: 'Face horizontal extent' },
  { key: 'eyePosition', label: 'Eye vertical position', salienceRank: 8, description: 'Eye height on face' },
] as const;

export const MAX_FEATURES = 8;
