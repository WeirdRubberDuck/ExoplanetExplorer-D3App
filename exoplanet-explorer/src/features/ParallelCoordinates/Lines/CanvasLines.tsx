import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { type DataItem, type Dimension } from '../types.ts';

export interface CanvasLinesProps {
  data: DataItem[];
  dimensions: Dimension[];

  xScale: d3.ScalePoint<string>;
  yPos: (d: DataItem, dim: Dimension) => number;

  width: number;
  height: number;
  xOffset?: number;
  yOffset?: number;

  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
}

export function CanvasLines({
  data,
  dimensions,
  xScale,
  yPos,
  width,
  height,
  xOffset = 0,
  yOffset = 0,
  opacity = 1.0,
  strokeWidth = 1,
  strokeColor = 'steelblue'
}: CanvasLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = strokeColor;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = strokeWidth;

    // Pre-compute x positions to avoid repeated scale lookups in the inner loop
    const xPositions = dimensions.map((dim) => xScale(dim.key) ?? 0);

    // Batch all paths into a single stroke call
    ctx.beginPath();

    data.forEach((row) => {
      dimensions.forEach((dim, idx) => {
        const x = xPositions[idx];
        const y = yPos(row, dim);

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    });

    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [data, dimensions, xScale, yPos, width, height, opacity, strokeWidth, strokeColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        left: xOffset,
        top: yOffset,
        pointerEvents: 'none'
      }}
    />
  );
}
