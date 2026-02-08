import { computeGeometry, lerp, clamp } from './geometry';
import { NEUTRAL_FACE, FaceParams } from './types';

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns b when t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe('clamp', () => {
  it('clamps below minimum', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it('passes through values in range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});

describe('computeGeometry', () => {
  it('produces symmetric geometry for neutral face', () => {
    const g = computeGeometry(NEUTRAL_FACE);

    // Face centered at origin
    expect(g.faceOutline.cx).toBe(0);
    expect(g.faceOutline.cy).toBe(0);

    // Eyes symmetric about x-axis
    expect(g.leftEye.cx).toBe(-g.rightEye.cx);
    expect(g.leftEye.cy).toBe(g.rightEye.cy);
    expect(g.leftEye.r).toBe(g.rightEye.r);

    // Pupils centered in eyes
    expect(g.leftPupil.cx).toBe(g.leftEye.cx);
    expect(g.leftPupil.cy).toBe(g.leftEye.cy);
    expect(g.rightPupil.cx).toBe(g.rightEye.cx);

    // Eyebrows symmetric
    expect(g.leftEyebrow.y1).toBe(g.rightEyebrow.y1);

    // Nose centered vertically
    expect(g.nose.x1).toBe(0);
    expect(g.nose.x2).toBe(0);
    expect(g.nose.y1).toBeLessThan(g.nose.y2);
  });

  it('produces wider face with faceWidth=1', () => {
    const wide = computeGeometry({ ...NEUTRAL_FACE, faceWidth: 1 });
    const narrow = computeGeometry({ ...NEUTRAL_FACE, faceWidth: 0 });

    expect(wide.faceOutline.rx).toBeGreaterThan(narrow.faceOutline.rx);
  });

  it('produces taller face with faceHeight=1', () => {
    const tall = computeGeometry({ ...NEUTRAL_FACE, faceHeight: 1 });
    const short = computeGeometry({ ...NEUTRAL_FACE, faceHeight: 0 });

    expect(tall.faceOutline.ry).toBeGreaterThan(short.faceOutline.ry);
  });

  it('produces larger eyes with eyeSize=1', () => {
    const large = computeGeometry({ ...NEUTRAL_FACE, eyeSize: 1 });
    const small = computeGeometry({ ...NEUTRAL_FACE, eyeSize: 0 });

    expect(large.leftEye.r).toBeGreaterThan(small.leftEye.r);
    expect(large.rightEye.r).toBeGreaterThan(small.rightEye.r);
  });

  it('produces longer nose with noseLength=1', () => {
    const long = computeGeometry({ ...NEUTRAL_FACE, noseLength: 1 });
    const short = computeGeometry({ ...NEUTRAL_FACE, noseLength: 0 });

    const longLen = long.nose.y2 - long.nose.y1;
    const shortLen = short.nose.y2 - short.nose.y1;
    expect(longLen).toBeGreaterThan(shortLen);
  });

  it('clamps out-of-range params', () => {
    const extreme: FaceParams = {
      mouthCurvature: 2,
      faceHeight: -1,
      eyeSize: 5,
      eyebrowLength: -3,
      noseLength: 10,
      mouthWidth: -0.5,
      faceWidth: 1.5,
      eyePosition: -2,
    };

    // Should not throw
    const g = computeGeometry(extreme);
    expect(g.faceOutline.rx).toBeGreaterThan(0);
  });
});
