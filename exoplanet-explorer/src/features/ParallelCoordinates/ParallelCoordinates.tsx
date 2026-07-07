import { useMemo } from 'react';

import { useAppSelector } from '@/redux/hooks.ts';
import type { DataItem } from '@/types/types.ts';

import { ParallelCoordinatesChart } from './Chart.tsx';

export function ParallelCoordinates() {
  const { full: data, uncertainty } = useAppSelector((state) => state.data);
  const { selectedColumns, lineOpacity, showGhostLines } = useAppSelector(
    (state) => state.local.parallelCoordinates.settings
  );

  // Collect the data for the parallel coordinates chart based on the selected columns
  // and the uncertainty data. We need nothing more
  const pcData = useMemo(() => {
    return data.map((item) => {
      const newItem: DataItem = { id: item.id };
      selectedColumns.forEach((col: string | number) => {
        newItem[col] = item[col];
        if (uncertainty[item.id] && uncertainty[item.id][col]) {
          newItem[`${col}_err`] = uncertainty[item.id][col].percentage ?? null;
        }
      });
      return newItem;
    });
  }, [data, selectedColumns, uncertainty]);

  return (
    <ParallelCoordinatesChart
      data={pcData}
      defaultHeight={400}
      maxHeight={1000}
      cfg={{
        lineOpacity,
        showGhostLines: showGhostLines
      }}
    />
  );
}
