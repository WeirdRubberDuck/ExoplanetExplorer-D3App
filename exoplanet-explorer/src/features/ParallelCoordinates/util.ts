import * as d3 from 'd3';

import type { Column, ColumnData, DataItem } from '@/types/types';

import type { Dimension } from './types';

export function inferDimensions(
  data: DataItem[],
  orderedColumns: Column[],
  logScaleColumns: Column[],
  columnData: Record<Column, ColumnData>,
  height: number
): Dimension[] {
  if (!data.length) return [];

  return orderedColumns.map((key) => {
    const col = columnData[key];

    if (!col) {
      throw new Error(`Column data for key "${key}" not found.`);
    }

    const isNumeric = col.type === 'number';
    const isLogScale = isNumeric && logScaleColumns.includes(key);

    if (isNumeric) {
      const d3Scale = isLogScale ? d3.scaleLog() : d3.scaleLinear().nice();
      const scale = d3Scale.domain([col.min, col.max]).range([height, 0]);
      return {
        key,
        type: 'number',
        scale
      };
    } else {
      const scale = d3
        .scalePoint<string>()
        .domain(col.categories)
        .range([height, 0])
        .padding(0.5);

      return {
        key,
        type: 'string',
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
