import { MdOpenInNew } from 'react-icons/md';
import { ActionIcon, Tooltip } from '@mantine/core';

import { apiEndpoint } from '@/api/api';
import { useAppSelector } from '@/redux/hooks';
import { buildChartUrl, type ChartMode, startupConfig } from '@/utils/urlConfig';

interface Props {
  chart: ChartMode;
}

export function OpenChartWindow({ chart }: Props) {
  const columns = useAppSelector((state) =>
    chart === 'parallelcoordinates'
      ? state.local.parallelCoordinates.columnOrder
      : state.local.cornerPlot.settings.selectedColumns
  );
  const autoSync = useAppSelector((state) => state.local.autoSyncOpenSpaceSelection);

  if (startupConfig.chart) {
    return null;
  }

  const label = `Open ${chart === 'parallelcoordinates' ? 'parallel coordinates' : 'scatterplot matrix'} in a new window`;
  return (
    <Tooltip label={label}>
      <ActionIcon
        variant={'default'}
        size={'md'}
        aria-label={label}
        onClick={() => {
          const url = buildChartUrl(window.location.href, {
            chart,
            columns,
            autoSync,
            ...apiEndpoint
          });
          window.open(url, '_blank', 'popup,width=1200,height=900,noopener,noreferrer');
        }}
      >
        <MdOpenInNew size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
