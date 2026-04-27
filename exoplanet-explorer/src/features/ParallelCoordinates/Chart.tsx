import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Group, Text } from '@mantine/core';
import { useResizeObserver, useViewportSize } from '@mantine/hooks';
import * as d3 from 'd3';

import { hasValue } from '@/utils/util.ts';

import { Axes } from './Axes/Axes.tsx';
import { CanvasLines } from './Lines/CanvasLines.tsx';
import { GhostLines } from './Lines/GhostLines.tsx';
import { useBrushing } from './hooks.ts';
import { MissingValueAxisLabel } from './MissinValueAxisLabel.tsx';
import { type Column, type DataItem, type Dimension } from './types.ts';
import { inferDimensions } from './util.ts';

interface Props {
  data: DataItem[];
  columns: Column[];
  cfg?: {
    strokeWidth?: number;
    lineOpacity?: number;
    showGhostLines?: boolean;
  };
}

export function ParallelCoordinatesChart({
  data,
  columns,
  cfg = {
    strokeWidth: 1, // The width of the stroke around each blob
    lineOpacity: 1.0, // Opacity of each line in the plot
    showGhostLines: false // Whether to show ghost lines for filtered out paths
  }
}: Props) {
  const [axisRenderKey, setAxisRenderKey] = useState(0);

  const { clearBrushes, handleBrush, handleBrushClear, handleNanBrush, filteredData } =
    useBrushing(data);

  const [containerRef, container] = useResizeObserver();
  const { height: viewportHeight } = useViewportSize();

  const fallbackHeight = 400;
  const computedHeight = viewportHeight > 0 ? 0.5 * viewportHeight : fallbackHeight;

  const chartHeight = container ? container.height : computedHeight;
  const chartWidth = container ? container.width : 400;

  const handleResetFilter = () => {
    clearBrushes();
    // Force re-render to clear brushes
    setAxisRenderKey((current) => current + 1);
  };

  // Extra margin for the left to fit the longest y axis labels
  const extraLeftMargin = 100;
  const extraRightMargin = 50;

  // Extra height to place the NaN axis
  const extraHeight = 0.05 * chartHeight;

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  const internalWidth =
    chartWidth - margin.left - extraLeftMargin - margin.right - extraRightMargin;

  const internalHeight = chartHeight - margin.top - margin.bottom - extraHeight;
  const heightWithNanAxis = chartHeight - extraHeight;
  const nanAxisYPos = 1.1 * internalHeight;

  const dimensions: Dimension[] = useMemo(
    () => inferDimensions(data, columns, internalHeight),
    [data, columns, internalHeight]
  );

  const xScale = useMemo(
    () =>
      d3
        .scalePoint<string>()
        .domain(dimensions.map((d) => d.key))
        .range([0, internalWidth]),
    [dimensions, internalWidth]
  );

  const yPos = useCallback(
    (d: DataItem, dim: Dimension): number => {
      if (dim.type === 'number') {
        const isMissing = !hasValue(d[dim.key]) || isNaN(Number(d[dim.key]));
        return isMissing ? nanAxisYPos : dim.scale(Number(d[dim.key]));
      }

      const isEmpty = d[dim.key] == null || String(d[dim.key]) === '';
      return isEmpty ? nanAxisYPos : dim.scale(String(d[dim.key]))!;
    },
    [nanAxisYPos]
  );

  const linesProps = {
    dimensions,
    xScale,
    yPos,
    xOffset: margin.left + extraLeftMargin,
    yOffset: margin.top,
    opacity: cfg.lineOpacity,
    strokeWidth: cfg.strokeWidth,
    width: internalWidth,
    height: heightWithNanAxis
  };

  return (
    <>
      <Group>
        <Button onClick={handleResetFilter}>Reset filter</Button>
        <Group gap={5}>
          <Text size={'md'} fw={500}>
            {filteredData.length}{' '}
          </Text>
          <Text size={'xs'} c={'dimmed'}>
            / {data.length} planets shown
          </Text>
        </Group>
      </Group>
      <Box
        style={{
          resize: 'vertical',
          height: computedHeight,
          maxHeight: viewportHeight > 0 ? viewportHeight : fallbackHeight,
          minHeight: 200,
          overflow: 'hidden'
        }}
        ref={containerRef}
      >
        <div style={{ position: 'relative', width: chartWidth, height: chartHeight }}>
          {/* Lines */}
          <GhostLines {...linesProps} data={data} />
          <CanvasLines {...linesProps} data={filteredData} strokeColor={'steelblue'} />

          {/* Axes */}
          <svg
            width={chartWidth}
            height={chartHeight}
            style={{ position: 'absolute', inset: 0 }}
          >
            <g transform={`translate(${margin.left + extraLeftMargin}, ${margin.top})`}>
              <Axes
                key={axisRenderKey}
                dimensions={dimensions}
                xScale={xScale}
                nanAxisYPos={nanAxisYPos}
                handleBrush={handleBrush}
                handleBrushClear={handleBrushClear}
                handleNanBrush={handleNanBrush}
              />
              {/* NaN axis line and label */}
              <MissingValueAxisLabel yPos={nanAxisYPos} width={internalWidth} />
            </g>
          </svg>
        </div>
      </Box>
    </>
  );
}
