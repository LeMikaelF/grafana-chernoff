import { groupEntities } from './grouping';
import { FaceEntity } from '../types';
import { NEUTRAL_FACE } from '../face/types';

function makeEntity(label: string, group: string): FaceEntity {
  return { label, group, metrics: {}, zScores: {}, params: { ...NEUTRAL_FACE } };
}

describe('groupEntities', () => {
  it('groups by group label', () => {
    const entities = [
      makeEntity('a', 'group1'),
      makeEntity('b', 'group2'),
      makeEntity('c', 'group1'),
    ];

    const groups = groupEntities(entities);
    expect(groups).toHaveLength(2);
    expect(groups[0].groupLabel).toBe('group1');
    expect(groups[0].entities).toHaveLength(2);
    expect(groups[1].groupLabel).toBe('group2');
    expect(groups[1].entities).toHaveLength(1);
  });

  it('sorts entities alphabetically within groups', () => {
    const entities = [
      makeEntity('charlie', 'g1'),
      makeEntity('alpha', 'g1'),
      makeEntity('bravo', 'g1'),
    ];

    const groups = groupEntities(entities);
    expect(groups[0].entities.map((e) => e.label)).toEqual(['alpha', 'bravo', 'charlie']);
  });

  it('sorts groups alphabetically with unnamed first', () => {
    const entities = [
      makeEntity('a', 'zebra'),
      makeEntity('b', ''),
      makeEntity('c', 'alpha'),
    ];

    const groups = groupEntities(entities);
    expect(groups.map((g) => g.groupLabel)).toEqual(['', 'alpha', 'zebra']);
  });

  it('handles empty input', () => {
    expect(groupEntities([])).toHaveLength(0);
  });

  it('handles all entities in one group', () => {
    const entities = [makeEntity('a', 'only'), makeEntity('b', 'only')];
    const groups = groupEntities(entities);
    expect(groups).toHaveLength(1);
    expect(groups[0].entities).toHaveLength(2);
  });
});
