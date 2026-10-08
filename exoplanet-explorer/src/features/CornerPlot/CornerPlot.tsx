import { useMemo } from 'react';

import { useBaseDataset } from '@/hooks/data';
import { useAppSelector } from '@/redux/hooks';
import type { DataItem } from '@/types/types';

import { CornerPlotChart } from './Chart';

interface Props {
  /**
   * Whether the corner plot chart is displayed in standalone mode.
   */
  standalone?: boolean;

  /**
   * Whether to hide the top bar of the chart, with settings and reset filter controls.
   */
  hideTopBar?: boolean;
}

export function CornerPlot({ standalone = false, hideTopBar = false }: Props) {
  const { uncertainty } = useAppSelector((state) => state.data);
  const { selectedColumns } = useAppSelector((state) => state.local.cornerPlot.settings);

  const data = useBaseDataset();

  const cornerData = useMemo(() => {
    return data.map((item) => {
      const next: DataItem = { id: item.id };

      selectedColumns.forEach((column) => {
        next[column] = item[column];

        if (uncertainty[item.id] && uncertainty[item.id][column]) {
          next[`${column}_err`] = uncertainty[item.id][column].percentage ?? null;
        }
      });

      return next;
    });
  }, [data, selectedColumns, uncertainty]);

  return (
    <CornerPlotChart
      data={cornerData}
      standalone={standalone}
      hideTopBar={hideTopBar}
      defaultWidth={900}
      defaultHeight={780}
    />
  );
}
