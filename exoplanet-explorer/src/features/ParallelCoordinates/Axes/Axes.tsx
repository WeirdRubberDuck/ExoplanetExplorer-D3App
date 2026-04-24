import * as d3 from 'd3';

import { type Dimension, NanBrushMode } from '../types.ts';

import { Axis } from './Axis.tsx';
import { MissingValueAxis } from './MissingValueAxis.tsx';

interface Props {
  dimensions: Dimension[];
  xScale: d3.ScalePoint<string>;
  nanAxisYPos: number;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
  handleNanBrush?: (dimension: Dimension, mode: NanBrushMode | undefined) => void;
}

export function Axes({
  dimensions,
  xScale,
  nanAxisYPos,
  handleBrush,
  handleBrushClear,
  handleNanBrush
}: Props) {
  return (
    <g className={'axes'}>
      {dimensions.map((dim) => (
        <g key={dim.key} transform={`translate(${xScale(dim.key)},0)`}>
          {/* Axis label - used for dragging */}
          <text
            className={'legend'}
            y={-9}
            fontSize={'11px'}
            fill={'var(--mantine-color-default-color)'}
            transform={'rotate(-21)'}
            textAnchor={'start'}
          >
            {dim.key}
          </text>
          <Axis
            dimension={dim}
            handleBrush={handleBrush}
            handleBrushClear={handleBrushClear}
          />
          <MissingValueAxis dimension={dim} y={nanAxisYPos} onBrush={handleNanBrush} />
        </g>
      ))}
    </g>
  );
}
