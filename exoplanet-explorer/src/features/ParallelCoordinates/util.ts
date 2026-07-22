import * as d3 from 'd3';

import type { Column, ColumnData, DataItem } from '@/types/types';

import type { Dimension } from './types';

export function inferDimensions(
  data: DataItem[],
  orderedColumns: Column[],
  columnData: Record<Column, ColumnData>,
  height: number
): Dimension[] {
  if (!data.length) return [];

  return orderedColumns.map((key) => {
    const col = columnData[key];
    const isNumeric = col.type === 'number';

    if (isNumeric) {
      const scale = d3
        .scaleLinear()
        .domain([col.min ?? 0, col.max ?? 1])
        .nice()
        .range([height, 0]);

      return {
        key,
        type: 'number' as const,
        scale
      };
    } else {
      const categories =
        col.categories ?? Array.from(new Set(data.map((d) => String(d[key]))));
      const scale = d3
        .scalePoint<string>()
        .domain(categories)
        .range([height, 0])
        .padding(0.5);

      return {
        key,
        type: 'string' as const,
        scale
      };
    }
  });
}

export function removeFromMap<T>(map: Record<Column, T>, key: string): Record<Column, T> {
  const copy = { ...map };
  delete copy[key];
  return copy;
}

export function addToMap<T>(
  map: Record<Column, T>,
  key: string,
  value: T
): Record<Column, T> {
  return {
    ...map,
    [key]: value
  };
}

export function isSameColumnArray(arr1: Column[], arr2: Column[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  for (const col of set2) {
    if (!set1.has(col)) {
      return false;
    }
  }
  return true;
}
