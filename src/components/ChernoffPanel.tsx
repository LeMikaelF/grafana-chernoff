import React, { useMemo, useState, useCallback } from 'react';
import { PanelProps } from '@grafana/data';
import { css } from '@emotion/css';
import { Portal, useStyles2 } from '@grafana/ui';
import { ChernoffOptions, FaceEntity, MetricMapping } from '../types';
import { processData } from '../data/pipeline';
import { resolveMetricMappings } from '../data/autoMapping';
import { DefaultChernoffRenderer } from '../face/defaultRenderer';
import { FaceGrid } from './FaceGrid';
import { GroupSection } from './GroupSection';
import { Tooltip } from './Tooltip';

interface Props extends PanelProps<ChernoffOptions> {}

const renderer = new DefaultChernoffRenderer();

const MIN_FACE_SIZE = 80;

const getStyles = () => {
  return {
    container: css`
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 4px;
    `,
    empty: css`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      opacity: 0.5;
      font-size: 14px;
    `,
  };
};

export const ChernoffPanel: React.FC<Props> = ({ options, data, width }) => {
  const styles = useStyles2(getStyles);

  const [hoveredEntity, setHoveredEntity] = useState<FaceEntity | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const groups = useMemo(
    () => processData(data.series, options),
    [data.series, options]
  );

  // Compute actual column count
  const columns = useMemo(() => {
    if (options.columns > 0) {
      return options.columns;
    }
    // Auto-fit: at least 1 column
    return Math.max(1, Math.floor((width - 8) / (MIN_FACE_SIZE + 12)));
  }, [options.columns, width]);

  // Compute current mappings for tooltip
  const mappings: MetricMapping[] = useMemo(() => {
    const allMetrics = new Set<string>();
    for (const group of groups) {
      for (const entity of group.entities) {
        for (const key of Object.keys(entity.metrics)) {
          allMetrics.add(key);
        }
      }
    }
    return resolveMetricMappings(Array.from(allMetrics), options.metricMappings);
  }, [groups, options.metricMappings]);

  const handleHover = useCallback((entity: FaceEntity, mouseX: number, mouseY: number) => {
    setHoveredEntity(entity);
    setTooltipPos({ x: mouseX, y: mouseY });
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredEntity(null);
  }, []);

  if (groups.length === 0) {
    return (
      <div className={styles.empty}>
        No data — configure a label field in panel options
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {groups.map((group) => (
        <GroupSection key={group.groupLabel} label={group.groupLabel}>
          <FaceGrid
            entities={group.entities}
            renderer={renderer}
            showLabels={options.showLabels}
            columns={columns}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </GroupSection>
      ))}

      {hoveredEntity && (
        <Portal>
          <Tooltip
            entity={hoveredEntity}
            mappings={mappings}
            position={tooltipPos}
          />
        </Portal>
      )}
    </div>
  );
};
