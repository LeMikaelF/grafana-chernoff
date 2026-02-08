import React, { useCallback, useMemo } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Select, InlineField, InlineFieldRow } from '@grafana/ui';
import { MetricMapping, ChernoffOptions } from '../types';
import { FaceParams } from '../face/types';
import { FEATURES } from '../face/constants';

type Props = StandardEditorProps<MetricMapping[], unknown, ChernoffOptions>;

const featureOptions = FEATURES.map((f) => ({
  label: `${f.salienceRank}. ${f.label}`,
  value: f.key,
  description: f.description,
}));

export const MetricMappingEditor: React.FC<Props> = ({ value, onChange, context }) => {
  const mappings = useMemo(() => value || [], [value]);

  const metricNames = useMemo(() => {
    const names = new Set<string>();
    if (context.data && context.data.length > 0) {
      for (const frame of context.data) {
        for (const field of frame.fields) {
          if (field.type === 'number') {
            names.add(field.name);
          }
        }
      }
    }
    return Array.from(names).map((n) => ({ label: n, value: n }));
  }, [context.data]);

  const handleAdd = useCallback(() => {
    const usedFeatures = new Set(mappings.map((m) => m.feature));
    const nextFeature = FEATURES.find((f) => !usedFeatures.has(f.key));
    if (!nextFeature) {
      return;
    }

    onChange([...mappings, { metricName: '', feature: nextFeature.key }]);
  }, [mappings, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = [...mappings];
      next.splice(index, 1);
      onChange(next);
    },
    [mappings, onChange]
  );

  const handleChange = useCallback(
    (index: number, field: 'metricName' | 'feature', val: string) => {
      const next = [...mappings];
      if (field === 'feature') {
        next[index] = { ...next[index], feature: val as keyof FaceParams };
      } else {
        next[index] = { ...next[index], metricName: val };
      }
      onChange(next);
    },
    [mappings, onChange]
  );

  return (
    <div>
      {mappings.map((mapping, i) => (
        <InlineFieldRow key={i}>
          <InlineField label="Metric" grow>
            {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
            <Select
              options={metricNames}
              value={mapping.metricName || undefined}
              onChange={(v) => handleChange(i, 'metricName', v.value || '')}
              placeholder="Select metric..."
              isClearable
            />
          </InlineField>
          <InlineField label="Feature">
            {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
            <Select
              options={featureOptions}
              value={mapping.feature}
              onChange={(v) => handleChange(i, 'feature', v.value || '')}
              width={24}
            />
          </InlineField>
          <Button
            variant="secondary"
            size="sm"
            icon="trash-alt"
            onClick={() => handleRemove(i)}
            tooltip="Remove mapping"
          />
        </InlineFieldRow>
      ))}
      <Button
        variant="secondary"
        size="sm"
        icon="plus"
        onClick={handleAdd}
        disabled={mappings.length >= 8}
      >
        Add mapping
      </Button>
    </div>
  );
};
