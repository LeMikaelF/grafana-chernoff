import React from 'react';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { FaceEntity, MetricMapping } from '../types';

interface TooltipProps {
  entity: FaceEntity;
  mappings: MetricMapping[];
  position: { x: number; y: number };
}

const getStyles = () => {
  return {
    tooltip: css`
      position: fixed;
      z-index: 10000;
      background: var(--grafana-bg-primary, #1e1e1e);
      border: 1px solid rgba(128, 128, 128, 0.3);
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 12px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      max-width: 300px;
    `,
    title: css`
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 13px;
    `,
    row: css`
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 1px 0;
    `,
    metricName: css`
      opacity: 0.7;
    `,
    values: css`
      text-align: right;
      white-space: nowrap;
    `,
    zScore: css`
      opacity: 0.5;
      margin-left: 4px;
    `,
  };
};

function formatValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return value.toFixed(0);
  }
  if (Math.abs(value) >= 1) {
    return value.toFixed(1);
  }
  return value.toFixed(3);
}

function formatZScore(z: number): string {
  const sign = z >= 0 ? '+' : '';
  return `${sign}${z.toFixed(1)}σ`;
}

export const Tooltip: React.FC<TooltipProps> = ({ entity, mappings, position }) => {
  const styles = useStyles2(getStyles);

  return (
    <div
      className={styles.tooltip}
      style={{ left: position.x + 12, top: position.y - 10 }}
      data-testid="face-tooltip"
    >
      <div className={styles.title}>{entity.label}</div>
      {mappings.map((m) => {
        const value = entity.metrics[m.metricName];
        const zScore = entity.zScores[m.metricName];
        if (value === undefined) {
          return null;
        }
        return (
          <div key={m.metricName} className={styles.row}>
            <span className={styles.metricName}>{m.metricName}</span>
            <span className={styles.values}>
              {formatValue(value)}
              {zScore !== undefined && (
                <span className={styles.zScore}>{formatZScore(zScore)}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};
