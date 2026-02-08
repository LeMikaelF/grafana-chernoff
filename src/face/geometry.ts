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
  nose: { path: string };
  mouth: { path: string };
}

export function computeGeometry(params: FaceParams): FaceGeometry {
  const p = {
    mouthCurvature: clamp(params.mouthCurvature, 0, 1),
    faceHeight: clamp(params.faceHeight, 0, 1),
    eyeSize: clamp(params.eyeSize, 0, 1),
    eyebrowSlant: clamp(params.eyebrowSlant, 0, 1),
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
  const eyeR = lerp(2, 10, p.eyeSize);
  const pupilR = eyeR * 0.45;

  // Eyebrow slant: 0 = angry V (inner end high, outer end low)
  //                0.5 = flat
  //                1 = worried (inner end low, outer end high)
  const browHalfLen = 10;
  const browCenterY = eyeY - eyeR - 5;
  // Tilt: negative = inner end higher (angry), positive = outer end higher (worried)
  const browTilt = lerp(-6, 6, p.eyebrowSlant);

  // Nose — triangle that scales dramatically with noseLength
  // 0 = tiny nub, 1 = large prominent triangle
  const noseTop = lerp(2, -8, p.noseLength);
  const noseBottom = lerp(6, 22, p.noseLength);
  const noseHalfWidth = lerp(1, 10, p.noseLength);
  const nosePath = [
    `M 0 ${noseTop}`,
    `L ${-noseHalfWidth} ${noseBottom}`,
    `L ${noseHalfWidth} ${noseBottom}`,
    'Z',
  ].join(' ');

  // Mouth — cubic bezier with wider curvature range
  const mouthHalfW = lerp(6, 20, p.mouthWidth);
  const mouthY = lerp(faceRy * 0.35, faceRy * 0.55, 0.5);
  // Curvature: 0 = deep frown, 0.5 = flat, 1 = big smile
  const curvature = lerp(14, -14, p.mouthCurvature);
  // Cubic bezier with two control points for a more pronounced curve
  const cpX = mouthHalfW * 0.4;
  const mouthPath = `M ${-mouthHalfW} ${mouthY} C ${-cpX} ${mouthY + curvature} ${cpX} ${mouthY + curvature} ${mouthHalfW} ${mouthY}`;

  return {
    faceOutline: { cx: 0, cy: 0, rx: faceRx, ry: faceRy },
    leftEye: { cx: -eyeSpacing, cy: eyeY, r: eyeR },
    rightEye: { cx: eyeSpacing, cy: eyeY, r: eyeR },
    leftPupil: { cx: -eyeSpacing, cy: eyeY, r: pupilR },
    rightPupil: { cx: eyeSpacing, cy: eyeY, r: pupilR },
    // Left eyebrow: inner end is closer to center, outer end is further
    leftEyebrow: {
      x1: -eyeSpacing + browHalfLen,
      y1: browCenterY + browTilt,
      x2: -eyeSpacing - browHalfLen,
      y2: browCenterY - browTilt,
    },
    // Right eyebrow: mirrored
    rightEyebrow: {
      x1: eyeSpacing - browHalfLen,
      y1: browCenterY + browTilt,
      x2: eyeSpacing + browHalfLen,
      y2: browCenterY - browTilt,
    },
    nose: { path: nosePath },
    mouth: { path: mouthPath },
  };
}
