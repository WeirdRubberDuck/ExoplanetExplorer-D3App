import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { Dimension } from '../types';

interface Props {
  dimension: Dimension;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
}

export function Axis({ dimension, handleBrush, handleBrushClear }: Props) {
  const ref = useRef<SVGGElement>(null);

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
    <>
      <g ref={ref} />
      <g ref={brushRef} />
    </>
  );
}
