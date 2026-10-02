import * as d3 from 'd3';

import type { Column, ColumnData, DataItem } from '@/types/types';
import { hasValue } from '@/utils/util';

import type { Dimension } from './types';

export function getClippedDomain(
  values: number[],
  fallback: [number, number]
): [number, number] {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return fallback;

  let min = d3.quantileSorted(sorted, 0.01) ?? sorted[0];
  let max = d3.quantileSorted(sorted, 0.99) ?? sorted[sorted.length - 1];

  if (min === max) {
    max = max * 1.05 || max + 1;
    min *= 0.95;
  }

  return [min, max];
}

export function inferDimensions(
  data: DataItem[],
  orderedColumns: Column[],
  logScaleColumns: Column[],
  columnData: Record<Column, ColumnData>,
  height: number,
  clipExtremes: boolean
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
      let { min } = col;
      let { max } = col;

      if (clipExtremes) {
        const values = data
          .map((item) => {
            const value = item[key];
            if (!hasValue(value)) return undefined;

            const numericValue = Number(value);
            return Number.isFinite(numericValue) ? numericValue : undefined;
          })
          .filter((value): value is number => value !== undefined)
          .filter((value) => !isLogScale || value > 0);

        [min, max] = getClippedDomain(values, [min, max]);
      }

      const d3Scale = isLogScale ? d3.scaleLog() : d3.scaleLinear().nice();
      const scale = d3Scale.domain([min, max]).range([height, 0]);
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
