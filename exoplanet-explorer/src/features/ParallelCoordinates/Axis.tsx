import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { Dimension } from './types';

interface Props {
  dimension: Dimension;
  x: number;
}

export function Axis({ dimension, x }: Props) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const { scale } = dimension;
    const axis =
      'ticks' in scale ? d3.axisLeft<number>(scale) : d3.axisLeft<string>(scale);

    d3.select(ref.current).call(axis);
  }, [dimension]);

  return (
    <g ref={ref} transform={`translate(${x},0)`}>
      {/* Axis label */}
      <text
        className={'legend'}
        y={-9}
        fontSize={'11px'}
        fill={'var(--mantine-color-default-color)'}
        transform={'rotate(-21)'}
        textAnchor={'start'}
      >
        {dimension.key}
      </text>
    </g>
  );
}
