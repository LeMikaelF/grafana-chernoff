import { PanelPlugin } from '@grafana/data';
import { ChernoffOptions, DEFAULT_OPTIONS } from './types';
import { ChernoffPanel } from './components/ChernoffPanel';
import { MetricMappingEditor } from './components/MetricMappingEditor';

export const plugin = new PanelPlugin<ChernoffOptions>(ChernoffPanel)
  .setNoPadding()
  .setPanelOptions((builder) => {
    return builder
      .addTextInput({
        path: 'labelField',
        name: 'Label field',
        description: 'Field name to use as face labels (e.g., server, pod, service)',
        defaultValue: DEFAULT_OPTIONS.labelField,
        category: ['Data mapping'],
      })
      .addTextInput({
        path: 'groupByField',
        name: 'Group by field',
        description: 'Field name to group faces by (e.g., region, namespace)',
        defaultValue: DEFAULT_OPTIONS.groupByField,
        category: ['Data mapping'],
      })
      .addCustomEditor({
        id: 'metricMappings',
        path: 'metricMappings',
        name: 'Metric mappings',
        description: 'Override auto-mapping of metrics to facial features. Leave empty for automatic salience-based mapping.',
        editor: MetricMappingEditor,
        defaultValue: DEFAULT_OPTIONS.metricMappings,
        category: ['Data mapping'],
      })
      .addSliderInput({
        path: 'zScoreClamp',
        name: 'Z-score clamp',
        description: 'Standard deviations before clamping. Lower = more exaggerated differences.',
        defaultValue: DEFAULT_OPTIONS.zScoreClamp,
        settings: { min: 0.5, max: 5, step: 0.5 },
        category: ['Display'],
      })
      .addBooleanSwitch({
        path: 'showLabels',
        name: 'Show labels',
        description: 'Show entity labels under faces',
        defaultValue: DEFAULT_OPTIONS.showLabels,
        category: ['Display'],
      })
      .addNumberInput({
        path: 'columns',
        name: 'Columns',
        description: '0 = auto-fit based on panel width (minimum face size: 80px)',
        defaultValue: DEFAULT_OPTIONS.columns,
        settings: { min: 0, integer: true },
        category: ['Display'],
      })
      .addNumberInput({
        path: 'maxFaces',
        name: 'Max faces',
        description: '0 = unlimited',
        defaultValue: DEFAULT_OPTIONS.maxFaces,
        settings: { min: 0, integer: true },
        category: ['Display'],
      })
      .addNumberInput({
        path: 'aggregationWindowSeconds',
        name: 'Aggregation window (seconds)',
        description: '0 = use last value, >0 = average over time window',
        defaultValue: DEFAULT_OPTIONS.aggregationWindowSeconds,
        settings: { min: 0, integer: true },
        category: ['Data mapping'],
      });
  });
