import { useState } from 'react';
import { Box, Button, Group, Loader, Text } from '@mantine/core';
import { useDebouncedValue, useResizeObserver } from '@mantine/hooks';

import type { Column, DataItem, UncertaintyDataItem } from '@/types/types.ts';

import { Axes } from './Axes/Axes.tsx';
import { CanvasLines } from './Lines/CanvasLines.tsx';
import { GhostLines } from './Lines/GhostLines.tsx';
import { useBrushing, useChartScales } from './hooks.ts';

interface Props {
  data: DataItem[];
  columns: Column[];
  uncertaintyData?: Record<Column, UncertaintyDataItem>[];
  defaultHeight?: number;
  maxHeight?: number;
  cfg?: {
    strokeWidth?: number;
    lineOpacity?: number;
    showGhostLines?: boolean;
  };
}

const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const extraLeftMargin = 100;
const extraRightMargin = 50;

function useChartLayout(containerWidth: number, containerHeight: number) {
  const extraHeight = 0.1 * containerHeight;
  const internalWidth =
    containerWidth - margin.left - extraLeftMargin - margin.right - extraRightMargin;
  const internalHeight = containerHeight - margin.top - margin.bottom - extraHeight;
  const heightWithNanAxis = containerHeight - extraHeight;
  const nanAxisYPos = 1.1 * internalHeight;

  return { internalWidth, internalHeight, heightWithNanAxis, nanAxisYPos };
}

export function ParallelCoordinatesChart({
  data,
  columns,
  defaultHeight = 400,
  maxHeight = 1000,
  cfg = {
    strokeWidth: 1,
    lineOpacity: 1.0,
    showGhostLines: false
  }
}: Props) {
  const [axisRenderKey, setAxisRenderKey] = useState(0);
  const [enabledUncertaintyColumns, setEnabledUncertaintyColumns] = useState<Column[]>(
    []
  );

  const { clearBrushes, handleBrush, handleBrushClear, handleNanBrush, filteredData } =
    useBrushing(data);

  const [containerRef, container] = useResizeObserver();

  const [{ chartHeight, chartWidth }] = useDebouncedValue(
    {
      chartHeight: container ? container.height : defaultHeight,
      chartWidth: container ? container.width : 400
    },
    200,
    { leading: true }
  );

  const isLoading = !container || chartWidth === 0 || chartHeight === 0;

  const { internalWidth, internalHeight, heightWithNanAxis, nanAxisYPos } =
    useChartLayout(chartWidth, chartHeight);

  // Dimensions are the diimensions to render, including uncertainty axes if enabled
  const { dimensions, xScale, yPos } = useChartScales(
    data,
    columns,
    enabledUncertaintyColumns,
    internalWidth,
    internalHeight,
    nanAxisYPos
  );

  const handleResetFilter = () => {
    clearBrushes();
    setAxisRenderKey((current) => current + 1);
  };

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
          resize: 'both',
          height: defaultHeight,
          maxHeight: maxHeight,
          minHeight: 200,
          overflow: 'hidden'
        }}
        ref={containerRef}
      >
        {isLoading ? (
          <Loader size={'xl'} style={{ display: 'block', margin: '100px auto' }} />
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Lines */}
            {cfg.showGhostLines && <GhostLines {...linesProps} data={data} />}
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
                  enabledUncertaintyColumns={enabledUncertaintyColumns}
                  xScale={xScale}
                  nanAxisYPos={nanAxisYPos}
                  handleBrush={handleBrush}
                  handleBrushClear={handleBrushClear}
                  handleNanBrush={handleNanBrush}
                  onUncertaintyToggle={(dimensionKey, enabled) => {
                    if (enabled) {
                      setEnabledUncertaintyColumns((prev) => [...prev, dimensionKey]);
                    } else {
                      setEnabledUncertaintyColumns((prev) =>
                        prev.filter((col) => col !== dimensionKey)
                      );
                    }
                  }}
                />
              </g>
            </svg>
          </div>
        )}
      </Box>
    </>
  );
}
