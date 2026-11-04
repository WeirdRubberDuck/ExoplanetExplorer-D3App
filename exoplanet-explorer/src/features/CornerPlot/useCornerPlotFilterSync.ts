import { useEffect, useMemo, useRef } from 'react';

import { useAppDispatch } from '@/redux/hooks';
import { setCornerPlotFilteredIds } from '@/redux/local/localSlice';
import type { Column, DataItem } from '@/types/types';

import { type ActiveBrush, combineBrushes } from './helpers';
import type { NumericScale } from './util';

interface Params {
  activeBrushes: ActiveBrush[];
  data: DataItem[];
  scales: Map<Column, NumericScale>;
}

export function useCornerPlotFilterSync({ activeBrushes, data, scales }: Params): void {
  const dispatch = useAppDispatch();

  const brushIds = useMemo(() => {
    return combineBrushes(activeBrushes, data, scales);
  }, [activeBrushes, data, scales]);

  const previousDispatchedIdsRef = useRef<number[] | undefined>(undefined);

  useEffect(() => {
    const prevIds = previousDispatchedIdsRef.current;

    if (brushIds === undefined && prevIds === undefined) {
      return;
    }

    if (brushIds === undefined || prevIds === undefined) {
      previousDispatchedIdsRef.current = brushIds;
      dispatch(setCornerPlotFilteredIds(brushIds));
      return;
    }

    const isSame =
      prevIds.length === brushIds.length &&
      prevIds.every((id, index) => id === brushIds[index]);
    if (isSame) {
      return;
    }

    previousDispatchedIdsRef.current = brushIds;
    dispatch(setCornerPlotFilteredIds(brushIds));
  }, [brushIds, dispatch]);
}
