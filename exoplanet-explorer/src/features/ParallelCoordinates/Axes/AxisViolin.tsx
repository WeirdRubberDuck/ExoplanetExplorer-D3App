import { useMemo } from 'react';
import * as d3 from 'd3';

import type { DataItem } from '@/types/types';
import { hasValue } from '@/utils/util';

import type { Dimension } from '../types';

interface Props {
  dimension: Dimension;
  data: DataItem[];
  maxHalfWidth?: number;
  fill?: string;
  opacity?: number;
}

function computeValueY(
  value: DataItem[string],
  dimension: Dimension
): number | undefined {
  if (dimension.type === 'number') {
    if (!hasValue(value)) {
      return undefined;
    }

    const numericValue = Number(value);
    if (isNaN(numericValue)) {
      return undefined;
    }

    return dimension.scale(numericValue);
  }

  if (!hasValue(value) || String(value) === '') {
    return undefined;
  }

  const y = dimension.scale(String(value));
  return y ?? undefined;
}

export function AxisViolin({
  dimension,
  data,
  maxHalfWidth = 8,
  fill = 'var(--mantine-primary-color-filled)',
  opacity = 0.2
}: Props) {
  const pathD = useMemo(() => {
    if (data.length < 2) {
      return undefined;
    }

    const range = dimension.scale.range();
    const minY = Math.min(...range);
    const maxY = Math.max(...range);
    const axisHeight = maxY - minY;

    if (!isFinite(axisHeight) || axisHeight <= 0) {
      return undefined;
    }

    const yValues = data
      .map((row) => computeValueY(row[dimension.key], dimension))
      .filter((value): value is number => value !== undefined);

    if (yValues.length < 2) {
      return undefined;
    }

    // Use a higher baseline bin density so concentrated distributions (for example near
    // zero) remain visible instead of collapsing into a few wide bins
    const binCount = Math.max(28, Math.floor(axisHeight / 8));
    const binSize = axisHeight / binCount;
    const counts = new Array<number>(binCount).fill(0);

    yValues.forEach((y) => {
      const index = Math.max(0, Math.min(binCount - 1, Math.floor((y - minY) / binSize)));
      counts[index] += 1;
    });

    // Small moving average smooths the shape and avoids jagged one-bin spikes
    const smoothed = counts.map((_, index) => {
      const prev = counts[Math.max(0, index - 1)];
      const curr = counts[index];
      const next = counts[Math.min(binCount - 1, index + 1)];
      return (prev + 2 * curr + next) / 4;
    });

    const maxCount = Math.max(...smoothed);
    if (maxCount <= 0) {
      return undefined;
    }

    const centers = smoothed.map((count, index) => {
      const y = minY + (index + 0.5) * binSize;
      const width = (count / maxCount) * maxHalfWidth;
      return { y, width };
    });

    // Anchor the violin to the full axis range so the shape reaches both ends.
    const profile = [{ y: minY, width: 0 }, ...centers, { y: maxY, width: 0 }];

    const left = profile.map((p) => [-p.width, p.y] as [number, number]);
    const right = [...profile].reverse().map((p) => [p.width, p.y] as [number, number]);

    const points = [...left, ...right, left[0]];

    const line = d3
      .line<[number, number]>()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x((p) => p[0])
      .y((p) => p[1]);

    const d = line(points);
    return d ? `${d}Z` : undefined;
  }, [data, dimension, maxHalfWidth]);

  if (!pathD) {
    return null;
  }

  return <path d={pathD} fill={fill} opacity={opacity} pointerEvents={'none'} />;
}
