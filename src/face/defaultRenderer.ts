import React from 'react';
import { FaceParams, FaceRenderer } from './types';
import { computeGeometry } from './geometry';

export class DefaultChernoffRenderer implements FaceRenderer {
  readonly name = 'Default Chernoff';
  readonly version = '1.0.0';

  render(params: FaceParams, width: number, height: number): React.ReactNode {
    const g = computeGeometry(params);

    // viewBox sized to fit the max possible face geometry with padding
    const viewBox = '-60 -70 120 140';

    return React.createElement(
      'svg',
      {
        width,
        height,
        viewBox,
        xmlns: 'http://www.w3.org/2000/svg',
        style: { overflow: 'visible' } as React.CSSProperties,
      },
      React.createElement(
        'g',
        {
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        },
        // Face outline
        React.createElement('ellipse', {
          key: 'face',
          cx: g.faceOutline.cx,
          cy: g.faceOutline.cy,
          rx: g.faceOutline.rx,
          ry: g.faceOutline.ry,
        }),
        // Left eye
        React.createElement('circle', {
          key: 'leye',
          cx: g.leftEye.cx,
          cy: g.leftEye.cy,
          r: g.leftEye.r,
        }),
        // Right eye
        React.createElement('circle', {
          key: 'reye',
          cx: g.rightEye.cx,
          cy: g.rightEye.cy,
          r: g.rightEye.r,
        }),
        // Left pupil
        React.createElement('circle', {
          key: 'lpupil',
          cx: g.leftPupil.cx,
          cy: g.leftPupil.cy,
          r: g.leftPupil.r,
          fill: 'currentColor',
        }),
        // Right pupil
        React.createElement('circle', {
          key: 'rpupil',
          cx: g.rightPupil.cx,
          cy: g.rightPupil.cy,
          r: g.rightPupil.r,
          fill: 'currentColor',
        }),
        // Left eyebrow
        React.createElement('line', {
          key: 'lbrow',
          x1: g.leftEyebrow.x1,
          y1: g.leftEyebrow.y1,
          x2: g.leftEyebrow.x2,
          y2: g.leftEyebrow.y2,
        }),
        // Right eyebrow
        React.createElement('line', {
          key: 'rbrow',
          x1: g.rightEyebrow.x1,
          y1: g.rightEyebrow.y1,
          x2: g.rightEyebrow.x2,
          y2: g.rightEyebrow.y2,
        }),
        // Nose
        React.createElement('line', {
          key: 'nose',
          x1: g.nose.x1,
          y1: g.nose.y1,
          x2: g.nose.x2,
          y2: g.nose.y2,
        }),
        // Mouth (quadratic bezier)
        React.createElement('path', {
          key: 'mouth',
          d: g.mouth.path,
          fill: 'none',
        })
      )
    );
  }
}
