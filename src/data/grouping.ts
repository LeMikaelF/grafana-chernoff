import { FaceEntity, FaceGroup } from '../types';

/**
 * Group entities by their group label and sort alphabetically within each group.
 * Groups are sorted alphabetically by group label.
 * Entities with empty group go into an unnamed group at the top.
 */
export function groupEntities(entities: FaceEntity[]): FaceGroup[] {
  const groups = new Map<string, FaceEntity[]>();

  for (const entity of entities) {
    const key = entity.group || '';
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entity);
  }

  // Sort entities within each group
  for (const entities of groups.values()) {
    entities.sort((a, b) => a.label.localeCompare(b.label));
  }

  // Sort groups alphabetically, unnamed group first
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === '' && b !== '') {
      return -1;
    }
    if (a !== '' && b === '') {
      return 1;
    }
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => ({
    groupLabel: key,
    entities: groups.get(key)!,
  }));
}
