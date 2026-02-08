import React from 'react';

/**
 * The contract between data pipeline and face rendering.
 * All values are normalized to [0, 1] where 0.5 = neutral/average.
 */
export interface FaceParams {
  mouthCurvature: number;  // 0=frown, 0.5=neutral, 1=smile
  faceHeight: number;      // 0=small, 0.5=normal, 1=tall
  eyeSize: number;         // 0=tiny, 0.5=normal, 1=large
  eyebrowSlant: number;    // 0=angry V, 0.5=flat, 1=worried/raised
  noseLength: number;      // 0=short, 0.5=normal, 1=long
  mouthWidth: number;      // 0=narrow, 0.5=normal, 1=wide
  faceWidth: number;       // 0=narrow, 0.5=normal, 1=wide
  eyePosition: number;     // 0=low, 0.5=normal, 1=high
}

export interface FaceRenderer {
  render(params: FaceParams, width: number, height: number): React.ReactNode;
  readonly name: string;
  readonly version: string;
}

/** A face with all features at neutral (population mean). */
export const NEUTRAL_FACE: FaceParams = {
  mouthCurvature: 0.5,
  faceHeight: 0.5,
  eyeSize: 0.5,
  eyebrowSlant: 0.5,
  noseLength: 0.5,
  mouthWidth: 0.5,
  faceWidth: 0.5,
  eyePosition: 0.5,
};

/** Feature keys ordered by perceptual salience (De Soete & De Corte, 1985). */
export const SALIENCE_ORDER: ReadonlyArray<keyof FaceParams> = [
  'mouthCurvature',
  'faceHeight',
  'eyeSize',
  'eyebrowSlant',
  'noseLength',
  'mouthWidth',
  'faceWidth',
  'eyePosition',
] as const;
