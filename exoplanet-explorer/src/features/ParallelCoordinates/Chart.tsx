import { useCallback, useMemo } from 'react';
import * as d3 from 'd3';

import { hasValue } from '@/utils/util.ts';

import { Axes } from './Axes/Axes.tsx';
import { CanvasLines } from './Lines/CanvasLines.tsx';
import { GhostLines } from './Lines/GhostLines.tsx';
import { MissingValueAxisLabel } from './MissinValueAxisLabel.tsx';
import { type Column, type DataItem, type Dimension, NanBrushMode } from './types.ts';
import { inferDimensions } from './util.ts';

interface Props {
  data: DataItem[];
  filteredData: DataItem[];
  columns: Column[];
  width: number;
  height: number;
  cfg?: {
    strokeWidth?: number;
    lineOpacity?: number;
    showGhostLines?: boolean;
  };
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
  handleNanBrush?: (dimension: Dimension, mode: NanBrushMode | undefined) => void;
}

export function ParallelCoordinatesChart({
  data,
  filteredData,
  columns,
  width,
  height,
  cfg = {
    strokeWidth: 1, // The width of the stroke around each blob
    lineOpacity: 1.0, // Opacity of each line in the plot
    showGhostLines: false // Whether to show ghost lines for filtered out paths
  },
  handleBrush,
  handleBrushClear,
  handleNanBrush
}: Props) {
  // Extra margin for the left to fit the longest y axis labels
  const extraLeftMargin = 100;
  const extraRightMargin = 50;

  // Extra height to place the NaN axis
  const extraHeight = 0.05 * height;

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  const internalWidth =
    width - margin.left - extraLeftMargin - margin.right - extraRightMargin;

  const internalHeight = height - margin.top - margin.bottom - extraHeight;
  const heightWithNanAxis = height - extraHeight;
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
    <div style={{ position: 'relative', width, height }}>
      {/* Lines */}
      <GhostLines {...linesProps} data={data} />
      <CanvasLines {...linesProps} data={filteredData} strokeColor={'steelblue'} />

      {/* Axes */}
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${margin.left + extraLeftMargin}, ${margin.top})`}>
          <Axes
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
  );
}
