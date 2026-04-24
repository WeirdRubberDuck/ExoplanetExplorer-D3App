import { useCallback, useMemo, useState } from 'react';

import { hasValue } from '@/utils/util';

import {
  type BrushFilter,
  type Column,
  type DataItem,
  type Dimension,
  NanBrushMode
} from './types';
import { addToMap, removeFromMap } from './util';

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

  const filteredData = useMemo(
    () => data.filter((row) => passesNanBrushes(row) && passesAxisBrushes(row)),
    [data, passesNanBrushes, passesAxisBrushes]
  );

  return {
    clearBrushes,
    handleBrush,
    handleBrushClear,
    handleNanBrush,
    filteredData
  };
}
