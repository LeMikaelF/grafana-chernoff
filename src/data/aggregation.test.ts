import { FieldType, MutableDataFrame } from '@grafana/data';
import { extractEntities } from './aggregation';

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

describe('extractEntities', () => {
  it('returns empty for no frames', () => {
    const result = extractEntities([], 'server', '', 0);
    expect(result).toHaveLength(0);
  });

  it('extracts entities from table format', () => {
    const frame = makeTableFrame([
      { server: 'web-01', region: 'us-east', cpu: 45, memory: 60 },
      { server: 'web-02', region: 'us-west', cpu: 30, memory: 50 },
    ]);

    const result = extractEntities([frame], 'server', 'region', 0);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe('web-01');
    expect(result[0].group).toBe('us-east');
    expect(result[0].metrics.cpu).toBe(45);
    expect(result[0].metrics.memory).toBe(60);
    expect(result[1].label).toBe('web-02');
    expect(result[1].group).toBe('us-west');
  });

  it('handles missing label field gracefully', () => {
    const frame = makeTableFrame([
      { cpu: 45, memory: 60 },
    ]);

    const result = extractEntities([frame], 'server', '', 0);
    expect(result).toHaveLength(0);
  });

  it('handles empty group field', () => {
    const frame = makeTableFrame([
      { server: 'web-01', cpu: 45 },
    ]);

    const result = extractEntities([frame], 'server', '', 0);
    expect(result).toHaveLength(1);
    expect(result[0].group).toBe('');
  });
});
