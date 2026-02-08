import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChernoffPanel } from './ChernoffPanel';
import { DEFAULT_OPTIONS } from '../types';
import { FieldType, LoadingState } from '@grafana/data';

// Minimal PanelProps mock
function makePanelProps(overrides: Record<string, any> = {}) {
  const fields = [
    { name: 'server', type: FieldType.string, values: ['web-01', 'web-02', 'api-01'], config: {} },
    { name: 'region', type: FieldType.string, values: ['us-east', 'us-east', 'eu-west'], config: {} },
    { name: 'cpu', type: FieldType.number, values: [50, 30, 70], config: {} },
    { name: 'memory', type: FieldType.number, values: [60, 40, 80], config: {} },
  ];

  return {
    options: {
      ...DEFAULT_OPTIONS,
      labelField: 'server',
      groupByField: 'region',
      ...overrides.options,
    },
    data: {
      state: LoadingState.Done,
      series: [{ fields, length: 3, refId: 'A' }],
      timeRange: {} as any,
      ...overrides.data,
    },
    width: 800,
    height: 600,
    id: 1,
    fieldConfig: { defaults: {}, overrides: [] },
    timeRange: {} as any,
    timeZone: 'utc',
    transparent: false,
    title: 'Test',
    eventBus: { subscribe: jest.fn(), getStream: jest.fn(), publish: jest.fn(), removeAllListeners: jest.fn(), newScopedBus: jest.fn() } as any,
    renderCounter: 0,
    replaceVariables: (s: string) => s,
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    onChangeTimeRange: jest.fn(),
    ...overrides,
  };
}

describe('ChernoffPanel', () => {
  it('renders faces for table data', () => {
    const props = makePanelProps();
    render(<ChernoffPanel {...props} />);

    expect(screen.getByTestId('face-card-web-01')).toBeInTheDocument();
    expect(screen.getByTestId('face-card-web-02')).toBeInTheDocument();
    expect(screen.getByTestId('face-card-api-01')).toBeInTheDocument();
  });

  it('shows empty message when no label field configured', () => {
    const props = makePanelProps({ options: { ...DEFAULT_OPTIONS, labelField: '' } });
    render(<ChernoffPanel {...props} />);

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('shows labels when showLabels is true', () => {
    const props = makePanelProps({
      options: { ...DEFAULT_OPTIONS, showLabels: true, labelField: 'server', groupByField: 'region' },
    });
    render(<ChernoffPanel {...props} />);

    expect(screen.getByText('web-01')).toBeInTheDocument();
  });

  it('hides labels when showLabels is false', () => {
    const props = makePanelProps({
      options: { ...DEFAULT_OPTIONS, showLabels: false, labelField: 'server', groupByField: '' },
    });
    render(<ChernoffPanel {...props} />);

    // Labels should not be in the document as visible text nodes
    expect(screen.queryByText('web-01')).not.toBeInTheDocument();
  });
});
