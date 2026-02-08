import { FaceParams } from './types';

/** Linear interpolation: t=0 → a, t=1 → b. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * All geometry is computed in a normalized coordinate system where:
 * - Center is (0, 0)
 * - The face fits within a bounding box of roughly [-50, -60] to [50, 60]
 * - The caller scales to actual pixel size via SVG viewBox
 */

export interface FaceGeometry {
  faceOutline: { cx: number; cy: number; rx: number; ry: number };
  leftEye: { cx: number; cy: number; r: number };
  rightEye: { cx: number; cy: number; r: number };
  leftPupil: { cx: number; cy: number; r: number };
  rightPupil: { cx: number; cy: number; r: number };
  leftEyebrow: { x1: number; y1: number; x2: number; y2: number };
  rightEyebrow: { x1: number; y1: number; x2: number; y2: number };
  nose: { x1: number; y1: number; x2: number; y2: number };
  mouth: { path: string };
}

export function computeGeometry(params: FaceParams): FaceGeometry {
  const p = {
    mouthCurvature: clamp(params.mouthCurvature, 0, 1),
    faceHeight: clamp(params.faceHeight, 0, 1),
    eyeSize: clamp(params.eyeSize, 0, 1),
    eyebrowLength: clamp(params.eyebrowLength, 0, 1),
    noseLength: clamp(params.noseLength, 0, 1),
    mouthWidth: clamp(params.mouthWidth, 0, 1),
    faceWidth: clamp(params.faceWidth, 0, 1),
    eyePosition: clamp(params.eyePosition, 0, 1),
  };

  // Face outline (ellipse)
  const faceRx = lerp(30, 48, p.faceWidth);
  const faceRy = lerp(35, 58, p.faceHeight);

  // Eye position (vertical)
  const eyeY = lerp(-5, -18, p.eyePosition);
  const eyeSpacing = faceRx * 0.45;

  // Eye size
  const eyeR = lerp(3, 8, p.eyeSize);
  const pupilR = eyeR * 0.45;

  // Eyebrow length
  const browHalfLen = lerp(5, 14, p.eyebrowLength);
  const browY = eyeY - eyeR - 4;

  // Nose
  const noseTop = lerp(-2, -8, p.noseLength * 0.5 + 0.25);
  const noseBottom = lerp(5, 15, p.noseLength);

  // Mouth
  const mouthHalfW = lerp(6, 18, p.mouthWidth);
  const mouthY = lerp(faceRy * 0.35, faceRy * 0.55, 0.5);
  // Curvature: 0 = frown (control point below), 0.5 = flat, 1 = smile (control point above)
  const curvature = lerp(10, -10, p.mouthCurvature);
  const mouthPath = `M ${-mouthHalfW} ${mouthY} Q 0 ${mouthY + curvature} ${mouthHalfW} ${mouthY}`;

  return {
    faceOutline: { cx: 0, cy: 0, rx: faceRx, ry: faceRy },
    leftEye: { cx: -eyeSpacing, cy: eyeY, r: eyeR },
    rightEye: { cx: eyeSpacing, cy: eyeY, r: eyeR },
    leftPupil: { cx: -eyeSpacing, cy: eyeY, r: pupilR },
    rightPupil: { cx: eyeSpacing, cy: eyeY, r: pupilR },
    leftEyebrow: {
      x1: -eyeSpacing - browHalfLen,
      y1: browY,
      x2: -eyeSpacing + browHalfLen,
      y2: browY,
    },
    rightEyebrow: {
      x1: eyeSpacing - browHalfLen,
      y1: browY,
      x2: eyeSpacing + browHalfLen,
      y2: browY,
    },
    nose: { x1: 0, y1: noseTop, x2: 0, y2: noseBottom },
    mouth: { path: mouthPath },
  };
}
