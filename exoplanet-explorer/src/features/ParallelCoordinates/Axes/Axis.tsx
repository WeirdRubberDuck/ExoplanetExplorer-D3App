import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import type { Dimension } from '../types';

interface Props {
  dimension: Dimension;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear?: (dimension: Dimension) => void;
  brushSelection?: [number, number];
  onMovePrevious?: () => void;
  onMoveNext?: () => void;
}

export function Axis({
  dimension,
  handleBrush,
  handleBrushClear,
  brushSelection,
  onMovePrevious,
  onMoveNext
}: Props) {
  const ref = useRef<SVGGElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const brushRef = useRef<SVGGElement>(null);
  const brushBehaviorRef = useRef<d3.BrushBehavior<unknown> | null>(null);
  const handleBrushRef = useRef(handleBrush);
  const handleBrushClearRef = useRef(handleBrushClear);
  const brushWidth = 7;

  useEffect(() => {
    handleBrushRef.current = handleBrush;
    handleBrushClearRef.current = handleBrushClear;
  }, [handleBrush, handleBrushClear]);

  // Axis setup
  useEffect(() => {
    if (!ref.current) return;

    const { scale } = dimension;
    const axis =
      'ticks' in scale ? d3.axisLeft<number>(scale) : d3.axisLeft<string>(scale);

    d3.select(ref.current).call(axis);
  }, [dimension]);

  // Create brush behavior once per axis scale/key changes.
  useEffect(() => {
    if (!brushRef.current) return;

    const brush = d3
      .brushY()
      .extent([
        [-brushWidth, dimension.scale.range()[1]],
        [brushWidth, dimension.scale.range()[0]]
      ])
      .on('brush end', (event) => {
        if (!event.sourceEvent) {
          return;
        }

        const { selection } = event;

        if (!selection) {
          handleBrushClearRef.current?.(dimension);
          return;
        }

        const [y0, y1] = selection;
        handleBrushRef.current(dimension, y0, y1);
      });

    brushBehaviorRef.current = brush;
    const brushSelectionGroup = d3.select(brushRef.current);
    brushSelectionGroup.call(brush);
  }, [dimension]);

  // Keep visual brush in sync without re-creating behavior on each render.
  useEffect(() => {
    if (!brushRef.current || !brushBehaviorRef.current) return;

    const group = d3.select(brushRef.current);
    const currentSelection = d3.brushSelection(brushRef.current) as
      | [number, number]
      | null;
    const nextSelection = brushSelection ?? null;

    const areEqual =
      (currentSelection === null && nextSelection === null) ||
      (currentSelection !== null &&
        nextSelection !== null &&
        Math.abs(currentSelection[0] - nextSelection[0]) < 0.5 &&
        Math.abs(currentSelection[1] - nextSelection[1]) < 0.5);

    if (areEqual) {
      return;
    }

    group.call(brushBehaviorRef.current.move, nextSelection);
  }, [brushSelection]);

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
        {!dimension.isUncertainty && (
          <>
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
          </>
        )}
      </g>
      <g ref={ref} opacity={dimension.isUncertainty ? 0.5 : 1.0} />
      <g ref={brushRef} />
    </g>
  );
}
