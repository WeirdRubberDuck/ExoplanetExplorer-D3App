import { useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';

import { hasValue } from '@/utils/util';

import {
  type BrushFilter,
  type Column,
  type DataItem,
  type Dimension,
  NanBrushMode
} from './types';
import { addToMap, inferDimensions, removeFromMap } from './util';

export function useChartScales(
  data: DataItem[],
  columns: Column[],
  width: number,
  height: number,
  nanAxisYPos: number
) {
  const dimensions: Dimension[] = useMemo(
    () => inferDimensions(data, columns, height),
    [data, columns, height]
  );

  const xScale = useMemo(
    () =>
      d3
        .scalePoint<string>()
        .domain(dimensions.map((d) => d.key))
        .range([0, width]),
    [dimensions, width]
  );

  const yPos = useCallback(
    (d: DataItem, dim: Dimension): number => {
      if (dim.type === 'number') {
        const isMissing = !hasValue(d[dim.key]) || isNaN(Number(d[dim.key]));
        return isMissing ? nanAxisYPos : dim.scale(Number(d[dim.key]));
      }

      const isEmpty = d[dim.key] == null || String(d[dim.key]) === '';
      return isEmpty ? nanAxisYPos : dim.scale(String(d[dim.key]))!;
    },
    [nanAxisYPos]
  );

  return { dimensions, xScale, yPos };
}

export function useBrushing(data: DataItem[]) {
  const [brushes, setBrushes] = useState<Record<Column, BrushFilter>>({});
  const [nanBrushes, setNanBrushes] = useState<Record<Column, NanBrushMode>>({});

  function clearBrushes() {
    setBrushes({});
    setNanBrushes({});
  }

  function handleBrush(dimension: Dimension, y0: number, y1: number) {
    if (dimension.type === 'number') {
      const { scale } = dimension;

      const min = scale.invert(y1);
      const max = scale.invert(y0);

      setBrushes((prev) =>
        addToMap(prev, dimension.key, {
          type: 'number',
          extent: [min, max]
        })
      );
    } else {
      // Cateorical brushing
      const selectedCategories = dimension.scale.domain().filter((cat) => {
        const y = dimension.scale(cat);
        return y != null && y >= y0 && y <= y1;
      });

      setBrushes((prev) =>
        addToMap(prev, dimension.key, {
          type: 'string',
          selected: selectedCategories
        })
      );
    }
  }

  function handleBrushClear(dimension: Dimension) {
    setBrushes((prev) => removeFromMap(prev, dimension.key));
  }

  function handleNanBrush(dimension: Dimension, mode: NanBrushMode | undefined) {
    if (mode === undefined) {
      setNanBrushes((prev) => removeFromMap(prev, dimension.key));
      return;
    }
    setNanBrushes((prev) => addToMap(prev, dimension.key, mode));
  }

  const passesNanBrushes = useCallback(
    (row: DataItem) => {
      return Object.entries(nanBrushes).every(([key, mode]) => {
        const value = row[key];
        const hasVal = hasValue(value);
        if (mode === NanBrushMode.Block) {
          return hasVal;
        }
        if (mode === NanBrushMode.Filter) {
          return !hasVal;
        }
        return true;
      });
    },
    [nanBrushes]
  );

  const passesAxisBrushes = useCallback(
    (row: DataItem) => {
      return Object.entries(brushes).every(([key, filter]) => {
        const value = row[key];
        const hasVal = hasValue(value);

        if (filter.type === 'number') {
          const numericValue = Number(value);
          return (
            hasVal && numericValue >= filter.extent[0] && numericValue <= filter.extent[1]
          );
        }

        return hasVal && filter.selected.includes(String(value));
      });
    },
    [brushes]
  );

  const filteredData = useMemo(() => {
    if (Object.keys(brushes).length === 0 && Object.keys(nanBrushes).length === 0) {
      return data;
    }
    return data.filter((row) => passesNanBrushes(row) && passesAxisBrushes(row));
  }, [data, brushes, nanBrushes, passesNanBrushes, passesAxisBrushes]);

  return {
    clearBrushes,
    handleBrush,
    handleBrushClear,
    handleNanBrush,
    filteredData
  };
}
