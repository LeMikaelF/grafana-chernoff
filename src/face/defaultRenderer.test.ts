import React from 'react';
import { DefaultChernoffRenderer } from './defaultRenderer';
import { NEUTRAL_FACE, FaceParams } from './types';

describe('DefaultChernoffRenderer', () => {
  const renderer = new DefaultChernoffRenderer();

  it('has name and version', () => {
    expect(renderer.name).toBe('Default Chernoff');
    expect(renderer.version).toBe('1.0.0');
  });

  it('renders neutral face without throwing', () => {
    const result = renderer.render(NEUTRAL_FACE, 100, 100);
    expect(result).toBeTruthy();
  });

  it('renders extreme params without throwing', () => {
    const extreme: FaceParams = {
      mouthCurvature: 0,
      faceHeight: 1,
      eyeSize: 1,
      eyebrowLength: 0,
      noseLength: 1,
      mouthWidth: 0,
      faceWidth: 1,
      eyePosition: 0,
    };
    const result = renderer.render(extreme, 200, 200);
    expect(result).toBeTruthy();
  });

  it('returns an SVG element', () => {
    const result = renderer.render(NEUTRAL_FACE, 100, 100) as React.ReactElement;
    expect(result.type).toBe('svg');
    expect(result.props.width).toBe(100);
    expect(result.props.height).toBe(100);
  });

  it('renders different faces for different params', () => {
    const happy: FaceParams = { ...NEUTRAL_FACE, mouthCurvature: 1 };
    const sad: FaceParams = { ...NEUTRAL_FACE, mouthCurvature: 0 };

    const happyEl = renderer.render(happy, 100, 100) as React.ReactElement;
    const sadEl = renderer.render(sad, 100, 100) as React.ReactElement;

    // Get the <g> element children
    const happyG = React.Children.toArray(happyEl.props.children)[0] as React.ReactElement;
    const sadG = React.Children.toArray(sadEl.props.children)[0] as React.ReactElement;
    const happyParts = React.Children.toArray(happyG.props.children) as React.ReactElement[];
    const sadParts = React.Children.toArray(sadG.props.children) as React.ReactElement[];

    // Find the path element (mouth) — it's the last child
    const happyMouth = happyParts.find((c) => c.type === 'path');
    const sadMouth = sadParts.find((c) => c.type === 'path');

    expect(happyMouth).toBeTruthy();
    expect(sadMouth).toBeTruthy();
    expect(happyMouth!.props.d).not.toBe(sadMouth!.props.d);
  });
});
