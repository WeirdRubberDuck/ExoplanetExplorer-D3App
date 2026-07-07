import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setParallelCoordinatesFilteredIds } from '@/redux/local/localSlice';
import type { Column, DataItem } from '@/types/types';
import { hasValue } from '@/utils/util';

import { type BrushFilter, type Dimension, NanBrushMode } from './types';
import { addToMap, inferDimensions, removeFromMap } from './util';

export interface FilteredDataView {
  rows: DataItem[];
  ids: number[];
}

export function useHasUncertaintyColumn() {
  const uncertaintyDomains = useAppSelector((state) => state.data.uncertaintyDomains);

  function hasUncertaintyColumn(column: Column): boolean {
    return uncertaintyDomains[column] !== undefined;
  }
  return { hasUncertaintyColumn };
}

export function useChartScales(
  data: DataItem[],
  columns: Column[],
  enabledUncertaintyColumns: Column[],
  width: number,
  height: number,
  nanAxisYPos: number
) {
  const uncertaintyDomains = useAppSelector((state) => state.data.uncertaintyDomains);

  const dimensions: Dimension[] = useMemo(
    () => inferDimensions(data, columns, height),
    [data, columns, height]
  );

  const combinedDimensions = useMemo(() => {
    const finalDimensions: Dimension[] = [];
    dimensions.forEach((dim) => {
      finalDimensions.push(dim);

      if (
        enabledUncertaintyColumns.includes(dim.key) &&
        dim.type === 'number' &&
        uncertaintyDomains[dim.key]
      ) {
        const { min, max } = uncertaintyDomains[dim.key];
        const scale = d3.scaleLinear().domain([min, max]).nice().range([height, 0]);

        finalDimensions.push({
          key: `${dim.key}_err`,
          type: 'number',
          scale,
          isUncertainty: true
        });
      }
    });
    return finalDimensions;
  }, [dimensions, enabledUncertaintyColumns, uncertaintyDomains, height]);

  const xScale = useMemo(
    () =>
      d3
        .scalePoint<string>()
        .domain(combinedDimensions.map((d) => d.key))
        .range([0, width]),
    [combinedDimensions, width]
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

  return { dimensions: combinedDimensions, xScale, yPos };
}

export function useBrushing(data: DataItem[]) {
  const dispatch = useAppDispatch();
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

  const hasActiveFilters = useMemo(
    () => Object.keys(brushes).length > 0 || Object.keys(nanBrushes).length > 0,
    [brushes, nanBrushes]
  );

  const filteredRows = useMemo(() => {
    if (!hasActiveFilters) {
      return data;
    }
    return data.filter((row) => passesNanBrushes(row) && passesAxisBrushes(row));
  }, [data, hasActiveFilters, passesNanBrushes, passesAxisBrushes]);

  const filteredData = useMemo<FilteredDataView>(() => {
    const ids = filteredRows.map((row) => row.id);

    return {
      rows: filteredRows,
      ids
    };
  }, [filteredRows]);

  const previousDispatchedIdsRef = useRef<number[] | undefined>(undefined);

  useEffect(() => {
    const nextIds = hasActiveFilters ? filteredData.ids : undefined;
    const prevIds = previousDispatchedIdsRef.current;

    if (nextIds === undefined && prevIds === undefined) {
      return;
    }

    if (nextIds === undefined || prevIds === undefined) {
      previousDispatchedIdsRef.current = nextIds;
      dispatch(setParallelCoordinatesFilteredIds(nextIds));
      return;
    }

    const isSame =
      prevIds.length === nextIds.length &&
      prevIds.every((id, index) => id === nextIds[index]);
    if (isSame) {
      return;
    }

    previousDispatchedIdsRef.current = nextIds;
    dispatch(setParallelCoordinatesFilteredIds(nextIds));
  }, [dispatch, hasActiveFilters, filteredData.ids]);

  return {
    clearBrushes,
    handleBrush,
    handleBrushClear,
    handleNanBrush,
    filteredData
  };
}
