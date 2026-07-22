import * as d3 from 'd3';

import type { Column, DataItem } from '@/types/types';
import { hasValue } from '@/utils/util';

export interface NumericScale {
  column: Column;
  scale: d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number>;
  domain: [number, number];
  isLogScale: boolean;
}

export function getNumericValue(item: DataItem, column: Column): number | undefined {
  const value = item[column];
  if (!hasValue(value)) {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  return numericValue;
}

export function getScaleDomain(
  data: DataItem[],
  column: Column,
  isLogScale: boolean,
  clipExtremes: boolean
): [number, number] | undefined {
  const values = data
    .map((item) => getNumericValue(item, column))
    .filter((value): value is number => value !== undefined);

  if (!values.length) {
    return undefined;
  }

  const validValues = isLogScale ? values.filter((value) => value > 0) : values;
  if (!validValues.length) {
    return undefined;
  }

  if (!clipExtremes) {
    return [d3.min(validValues) ?? 0, d3.max(validValues) ?? 1];
  }

  const sorted = validValues.slice().sort((a, b) => a - b);
  const q01 = d3.quantileSorted(sorted, 0.01);
  const q99 = d3.quantileSorted(sorted, 0.99);

  const min = q01 ?? sorted[0];
  const max = q99 ?? sorted[sorted.length - 1];

  if (min === max) {
    return [min * 0.95, max * 1.05 || max + 1];
  }

  return [min, max];
}

export function buildNumericScale(
  domain: [number, number],
  range: [number, number],
  isLogScale: boolean
): d3.ScaleLinear<number, number> | d3.ScaleLogarithmic<number, number> {
  if (isLogScale) {
    const min = Math.max(Number.EPSILON, domain[0]);
    return d3.scaleLog().domain([min, domain[1]]).range(range).nice();
  }

  return d3.scaleLinear().domain(domain).range(range).nice();
}

export function calcPearsonCorrelation(
  data: DataItem[],
  xCol: Column,
  yCol: Column
): number | undefined {
  const pairs = data
    .map((item) => [getNumericValue(item, xCol), getNumericValue(item, yCol)] as const)
    .filter(
      (pair): pair is [number, number] => pair[0] !== undefined && pair[1] !== undefined
    );

  if (pairs.length < 3) {
    return undefined;
  }

  const xMean = d3.mean(pairs, (pair) => pair[0]) ?? 0;
  const yMean = d3.mean(pairs, (pair) => pair[1]) ?? 0;

  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;

  pairs.forEach(([x, y]) => {
    const dx = x - xMean;
    const dy = y - yMean;
    covariance += dx * dy;
    xVariance += dx * dx;
    yVariance += dy * dy;
  });

  if (xVariance === 0 || yVariance === 0) {
    return undefined;
  }

  return covariance / Math.sqrt(xVariance * yVariance);
}
