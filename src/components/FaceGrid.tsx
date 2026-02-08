import React from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { FaceEntity } from '../types';
import { FaceRenderer } from '../face/types';
import { FaceCard } from './FaceCard';

interface FaceGridProps {
  entities: FaceEntity[];
  renderer: FaceRenderer;
  showLabels: boolean;
  columns: number;
  onHover?: (entity: FaceEntity, rect: DOMRect) => void;
  onLeave?: () => void;
}

const MIN_FACE_SIZE = 80;

const getStyles = (columns: number) => {
  return {
    grid: css`
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: 4px;
      justify-items: center;
    `,
  };
};

export const FaceGrid: React.FC<FaceGridProps> = ({
  entities,
  renderer,
  showLabels,
  columns,
  onHover,
  onLeave,
}) => {
  const styles = useStyles2(() => getStyles(columns));
  const faceSize = Math.max(MIN_FACE_SIZE, Math.floor(MIN_FACE_SIZE * 1.2));

  return (
    <div className={styles.grid}>
      {entities.map((entity) => (
        <FaceCard
          key={entity.label}
          entity={entity}
          renderer={renderer}
          showLabel={showLabels}
          size={faceSize}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
};
