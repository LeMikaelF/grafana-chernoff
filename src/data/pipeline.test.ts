import { MutableDataFrame, FieldType } from '@grafana/data';
import { processData } from './pipeline';
import { ChernoffOptions, DEFAULT_OPTIONS } from '../types';

function makeTableFrame(rows: Array<Record<string, string | number>>): MutableDataFrame {
  if (rows.length === 0) {
    return new MutableDataFrame({ fields: [] });
  }

  const keys = Object.keys(rows[0]);
  const fields = keys.map((name) => ({
    name,
    type: typeof rows[0][name] === 'string' ? FieldType.string : FieldType.number,
    values: rows.map((r) => r[name]),
  }));

  return new MutableDataFrame({ fields } as any);
}

describe('processData', () => {
  const baseOptions: ChernoffOptions = {
    ...DEFAULT_OPTIONS,
    labelField: 'server',
    groupByField: 'region',
  };

  it('returns empty for empty frames', () => {
    const result = processData([], baseOptions);
    expect(result).toHaveLength(0);
  });

  it('processes table format into face groups', () => {
    const frame = makeTableFrame([
      { server: 'web-01', region: 'us-east', cpu: 50, memory: 60 },
      { server: 'web-02', region: 'us-east', cpu: 30, memory: 40 },
      { server: 'api-01', region: 'eu-west', cpu: 70, memory: 80 },
    ]);

    const result = processData([frame], baseOptions);

    // Should have 2 groups
    expect(result).toHaveLength(2);
    expect(result[0].groupLabel).toBe('eu-west');
    expect(result[1].groupLabel).toBe('us-east');

    // Each entity should have face params
    const entity = result[0].entities[0];
    expect(entity.label).toBe('api-01');
    expect(entity.params).toBeDefined();
    expect(entity.metrics.cpu).toBe(70);
  });

  it('applies maxFaces limit', () => {
    const frame = makeTableFrame([
      { server: 'a', region: '', cpu: 10 },
      { server: 'b', region: '', cpu: 20 },
      { server: 'c', region: '', cpu: 30 },
    ]);

    const result = processData([frame], { ...baseOptions, maxFaces: 2, groupByField: '' });
    const totalEntities = result.reduce((sum, g) => sum + g.entities.length, 0);
    expect(totalEntities).toBe(2);
  });

  it('handles single entity (no population for z-scores)', () => {
    const frame = makeTableFrame([
      { server: 'lonely', region: '', cpu: 50 },
    ]);

    const result = processData([frame], { ...baseOptions, groupByField: '' });
    expect(result).toHaveLength(1);
    expect(result[0].entities[0].params.mouthCurvature).toBe(0.5);
  });

  it('maps metrics to face features in salience order', () => {
    const frame = makeTableFrame([
      { server: 'a', region: '', cpu: 10, memory: 90 },
      { server: 'b', region: '', cpu: 90, memory: 10 },
    ]);

    const result = processData([frame], { ...baseOptions, groupByField: '' });
    const entityA = result[0].entities.find((e) => e.label === 'a')!;
    const entityB = result[0].entities.find((e) => e.label === 'b')!;

    // cpu maps to mouthCurvature (rank 1), memory to faceHeight (rank 2)
    // Entity A has low cpu → low mouthCurvature, high memory → high faceHeight
    expect(entityA.params.mouthCurvature).toBeLessThan(entityB.params.mouthCurvature);
    expect(entityA.params.faceHeight).toBeGreaterThan(entityB.params.faceHeight);
  });
});
