import * as d3 from 'd3';

import type { Column, DataItem } from '@/types/types';

import type { Dimension } from './types';

export function inferDimensions(
  data: DataItem[],
  columns: string[],
  height: number
): Dimension[] {
  if (!data.length) return [];

  return columns.map((key) => {
    const values = data.map((d) => d[key]).filter((v) => v != null);

    const numericValues = values.map((v) => Number(v));

    const numericCount = numericValues.filter((v) => !isNaN(v)).length;
    const numericRatio = values.length === 0 ? 0 : numericCount / values.length;
    const isNumeric = numericRatio > 0.8;

    if (isNumeric) {
      const cleanValues = numericValues.filter((v) => !isNaN(v));

      const scale = d3
        .scaleLinear()
        .domain(d3.extent(cleanValues) as [number, number])
        .nice()
        .range([height, 0]);

      return {
        key,
        type: 'number',
        scale
      };
    }

    const categories = Array.from(new Set(values.map((v) => String(v))));

    const scale = d3
      .scalePoint<string>()
      .domain(categories)
      .range([height, 0])
      .padding(0.5);

    return {
      key,
      type: 'string',
      scale
    };
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
