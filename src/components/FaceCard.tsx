import React, { useCallback, useRef } from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { FaceEntity } from '../types';
import { FaceRenderer } from '../face/types';

interface FaceCardProps {
  entity: FaceEntity;
  renderer: FaceRenderer;
  showLabel: boolean;
  size: number;
  onHover?: (entity: FaceEntity, rect: DOMRect) => void;
  onLeave?: () => void;
}

const getStyles = (size: number) => {
  return {
    card: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.15s ease;
      &:hover {
        background-color: rgba(128, 128, 128, 0.1);
      }
    `,
    face: css`
      width: ${size}px;
      height: ${size}px;
      flex-shrink: 0;
    `,
    label: css`
      margin-top: 2px;
      font-size: ${Math.max(10, size * 0.12)}px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: ${size}px;
      opacity: 0.8;
    `,
  };
};

export const FaceCard: React.FC<FaceCardProps> = ({
  entity,
  renderer,
  showLabel,
  size,
  onHover,
  onLeave,
}) => {
  const styles = useStyles2(() => getStyles(size));
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (onHover && cardRef.current) {
      onHover(entity, cardRef.current.getBoundingClientRect());
    }
  }, [entity, onHover]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      data-testid={`face-card-${entity.label}`}
    >
      <div className={styles.face}>
        {renderer.render(entity.params, size, size)}
      </div>
      {showLabel && (
        <div className={styles.label} title={entity.label}>
          {entity.label}
        </div>
      )}
    </div>
  );
};
