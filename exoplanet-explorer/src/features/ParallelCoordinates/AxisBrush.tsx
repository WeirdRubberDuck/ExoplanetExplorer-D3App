import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { Dimension } from './types';

interface Props {
  dimension: Dimension;
  x: number;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
}

export function AxisBrush({ dimension, x, handleBrush, handleBrushClear }: Props) {
  const ref = useRef<SVGGElement>(null);
  const brushWidth = 7;

  useEffect(() => {
    if (!ref.current) return;
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

    d3.select(ref.current).call(brush);
  }, [dimension, handleBrush, handleBrushClear]);

  return <g ref={ref} transform={`translate(${x},0)`} />;
}
