import { useMantineColorScheme } from '@mantine/core';
import * as d3 from 'd3';

import { hasValue } from '@/utils/util.ts';

import { Axis } from './Axis.tsx';
import { AxisBrush } from './AxisBrush.tsx';
import { useBrushing } from './hooks.ts';
import { MissingValueAxis } from './MissingValueAxis.tsx';
import { type DataItem, type Dimension } from './types.ts';
import { inferDimensions } from './util.ts';

const pcDefaultColumns = [
  'discoverymethod',
  'sy_pnum',
  'pl_bmasse',
  'pl_rade',
  'pl_orbincl',
  'pl_Teq',
  'sy_dist',
  'st_spectype',
  'st_age'
];

function MissingValueAxisLabel({
  yPos,
  width,
  showUncertaintyLabel = true
}: {
  yPos: number;
  width: number;
  showUncertaintyLabel?: boolean;
}) {
  const textPositionX = -20;
  const lineY = yPos + 15;
  const xExtend = 30;

  const line = d3.line()([
    [0 - xExtend, lineY],
    [width + xExtend, lineY]
  ]);

  return (
    <>
      <path d={line || undefined} stroke={'darkgray'} strokeWidth={0.4} />
      <g>
        <text
          className={'legend'}
          x={textPositionX}
          y={lineY}
          dy={-10}
          fontSize={'11px'}
          fill={'var(--mantine-color-default-color)'}
          textAnchor={'end'}
        >
          Missing values
        </text>
        {showUncertaintyLabel && (
          <text
            x={textPositionX}
            y={lineY}
            dy={17}
            fontSize={'11px'}
            fill={'var(--mantine-color-default-color)'}
            textAnchor={'end'}
          >
            Uncertainty axis
          </text>
        )}
      </g>
    </>
  );
}

export function ParallelCoordinatesChart({
  data,
  width,
  height,
  cfg = {
    strokeWidth: 1, // The width of the stroke around each blob
    lineOpacity: 1.0 // Opacity of each line in the plot
  }
}: {
  data: DataItem[];
  width: number;
  height: number;
  cfg?: {
    strokeWidth?: number;
    lineOpacity?: number;
  };
}) {
  console.log(data[0]);

  const { handleBrush, handleBrushClear, handleNanBrush, filteredData } =
    useBrushing(data);

  const { colorScheme } = useMantineColorScheme();

  // Extra margin for the left to fit the longest y axis labels
  const extraLeftMargin = 100;
  const extraRightMargin = 50;

  // Extra height to place the NaN axis
  const extraHeight = 60;

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  const internalWidth =
    width - margin.left - extraLeftMargin - margin.right - extraRightMargin;

  const internalHeight = height - margin.top - margin.bottom - extraHeight;

  const dimensions: Dimension[] = inferDimensions(data, pcDefaultColumns, internalHeight);

  const xScale = d3
    .scalePoint<string>()
    .domain(dimensions.map((d) => d.key))
    .range([0, internalWidth]);

  const nanAxisYPos = 1.1 * internalHeight;

  const line = d3.line<[number, number]>();

  function yPos(d: DataItem, dim: Dimension): number {
    if (dim.type === 'number') {
      const isMissing = !hasValue(d[dim.key]) || isNaN(Number(d[dim.key]));
      return isMissing ? nanAxisYPos : dim.scale(Number(d[dim.key]));
    }

    const isEmpty = d[dim.key] == null || String(d[dim.key]) === '';
    return isEmpty ? nanAxisYPos : dim.scale(String(d[dim.key]))!;
  }

  function path(row: DataItem) {
    const points: [number, number][] = dimensions.map((dim) => {
      const x = xScale(dim.key)!;
      const y = yPos(row, dim);
      return [x, y];
    });

    return line(points);
  }

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left + extraLeftMargin}, ${margin.top})`}>
        {/* Backround lines (for context when filtering) */}
        {data.map((d, i) => (
          <path
            key={i}
            d={path(d) ?? undefined}
            fill={'none'}
            stroke={
              colorScheme === 'dark'
                ? 'var(--mantine-color-dark-5)'
                : 'var(--mantine-color-gray-2)'
            }
            strokeWidth={cfg.strokeWidth}
          />
        ))}
        {/* Foreground lines (colored) */}
        {filteredData.map((d, i) => (
          <path
            key={i}
            d={path(d) ?? undefined}
            fill={'none'}
            stroke={'steelblue'}
            opacity={cfg.lineOpacity}
            strokeWidth={cfg.strokeWidth}
            // style={{ filter: "drop-shadow( 1px 1px 1px rgba(0, 0, 0, .1))" }}
          />
        ))}
        {/* Axes */}
        <g className={'axes'}>
          {dimensions.map((dim) => (
            <>
              <Axis key={dim.key} dimension={dim} x={xScale(dim.key)!} />
              <AxisBrush
                key={dim.key + '-brush'}
                dimension={dim}
                x={xScale(dim.key)!}
                handleBrush={handleBrush}
                handleBrushClear={handleBrushClear}
              />
              <MissingValueAxis
                key={dim.key + '-nan-axis'}
                dimension={dim}
                x={xScale(dim.key)!}
                y={nanAxisYPos}
                onBrush={handleNanBrush}
              />
            </>
          ))}
        </g>
        {/* NaN axis line and label */}
        <MissingValueAxisLabel yPos={nanAxisYPos} width={internalWidth} />
      </g>
    </svg>
  );
}
