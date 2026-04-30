import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import type { Dimension } from '../types';

interface Props {
  dimension: Dimension;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
  onMovePrevious?: () => void;
  onMoveNext?: () => void;
}

export function Axis({
  dimension,
  handleBrush,
  handleBrushClear,
  onMovePrevious,
  onMoveNext
}: Props) {
  const ref = useRef<SVGGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const brushRef = useRef<SVGGElement>(null);
  const brushWidth = 7;

  // Axis setup
  useEffect(() => {
    if (!ref.current) return;

    const { scale } = dimension;
    const axis =
      'ticks' in scale ? d3.axisLeft<number>(scale) : d3.axisLeft<string>(scale);

    d3.select(ref.current).call(axis);
  }, [dimension]);

  // Brush setup
  useEffect(() => {
    if (!brushRef.current) return;
    const brush = d3
      .brushY()
      .extent([
        [-brushWidth, dimension.scale.range()[1]],
        [brushWidth, dimension.scale.range()[0]]
      ])
      .on('brush end', (event) => {
        const { selection } = event;

        if (!selection) {
          handleBrushClear?.(dimension);
          return;
        }

        const [y0, y1] = selection;
        handleBrush(dimension, y0, y1);
      });

    d3.select(brushRef.current).call(brush);
  }, [dimension, handleBrush, handleBrushClear]);

  return (
    <g>
      <g onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <text
          className={'legend'}
          y={-9}
          fontSize={'11px'}
          fill={'var(--mantine-color-default-color)'}
          transform={'rotate(-21)'}
          textAnchor={'start'}
          opacity={dimension.isUncertainty ? 0.5 : 1.0}
        >
          {dimension.key}
        </text>
        <text
          x={-2}
          y={-25}
          fontSize={'14px'}
          fill={'var(--mantine-color-default-color)'}
          textAnchor={'end'}
          opacity={isHovered ? 0.5 : 0}
          style={{ cursor: 'pointer' }}
          onClick={onMovePrevious}
        >
          {'<'}
        </text>
        <text
          x={2}
          y={-25}
          fontSize={'14px'}
          fill={'var(--mantine-color-default-color)'}
          textAnchor={'start'}
          opacity={isHovered ? 0.5 : 0}
          style={{ cursor: 'pointer' }}
          onClick={onMoveNext}
        >
          {'>'}
        </text>
      </g>
      <g ref={ref} opacity={dimension.isUncertainty ? 0.5 : 1.0} />
      <g ref={brushRef} />
    </g>
  );
}
