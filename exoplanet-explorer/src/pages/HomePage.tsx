import { useEffect, useState } from 'react';
import { Alert, Box, Group, Loader } from '@mantine/core';

import { CornerPlot } from '@/features/CornerPlot/CornerPlot';
import { ParallelCoordinates } from '@/features/ParallelCoordinates/ParallelCoordinates';
import { SelectionList } from '@/features/SelectionList/SelectionList';
import { initializeData } from '@/redux/data/dataSlice';
import {
  setCornerPlotSelectedColumns,
  setParallelCoordinatesColumnOrder,
  setParallelCoordinatesSelectedColumns
} from '@/redux/local/localSlice';
import { store } from '@/redux/store';
import { getEligibleUncertaintyColumns, startupConfig } from '@/utils/urlConfig';

// TODO: Load real data from a server or local file
const dataUrl = new URL('../data/aggregated_data.json', import.meta.url).href;

interface PageInitialization {
  warnings: string[];
  uncertaintyColumns: string[];
}

let initialization: Promise<PageInitialization> | undefined;

function initializePage() {
  initialization ??= (async () => {
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`Could not load planet data (${response.status}).`);
    }
    store.dispatch(initializeData(await response.json()));

    const warnings = [...startupConfig.warnings];
    const { chart, columns: requestedColumns } = startupConfig;

    if (chart && requestedColumns) {
      const { columns, columnData } = store.getState().data;
      const selectedColumns = requestedColumns.filter(
        (column) =>
          columns.includes(column) &&
          (chart === 'parallelcoordinates' || columnData[column]?.type === 'number')
      );
      if (selectedColumns.length === 0) {
        warnings.push('No valid URL columns; using the default columns.');
      } else {
        if (selectedColumns.length !== requestedColumns.length) {
          warnings.push('Unavailable or nonnumeric URL columns were ignored.');
        }
        if (chart === 'parallelcoordinates') {
          store.dispatch(setParallelCoordinatesSelectedColumns(selectedColumns));
          store.dispatch(setParallelCoordinatesColumnOrder(selectedColumns));
        } else {
          store.dispatch(setCornerPlotSelectedColumns(selectedColumns));
        }
      }
    }

    let uncertaintyColumns: string[] = [];
    if (chart === 'parallelcoordinates' && startupConfig.uncertaintyColumns) {
      const { data, local } = store.getState();
      uncertaintyColumns = getEligibleUncertaintyColumns(
        startupConfig.uncertaintyColumns,
        local.parallelCoordinates.settings.selectedColumns,
        data.columnData,
        data.uncertaintyDomains
      );
      if (uncertaintyColumns.length !== startupConfig.uncertaintyColumns.length) {
        warnings.push(
          'Uncertainty columns that are not selected numeric axes with uncertainty data were ignored.'
        );
      }
    }
    return { warnings, uncertaintyColumns };
  })();

  return initialization;
}

export function HomePage() {
  const [pageInitialization, setPageInitialization] = useState<PageInitialization>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    if (startupConfig.chart) {
      document.title =
        startupConfig.chart === 'parallelcoordinates'
          ? 'Parallel Coordinates | Exoplanet Explorer'
          : 'Scatterplot Matrix | Exoplanet Explorer';
    }
    void initializePage()
      .then((messages) => {
        if (active) {
          setPageInitialization(messages);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : 'Could not load planet data.'
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (error)
    return (
      <Alert color={'red'} title={'Data loading failed'}>
        {error}
      </Alert>
    );
  if (!pageInitialization) return <Loader aria-label={'Loading planet data'} />;

  const { warnings, uncertaintyColumns } = pageInitialization;

  const warning =
    warnings.length > 0 ? (
      <Alert color={'yellow'} mb={'sm'} title={'URL configuration'}>
        {warnings.join(' ')}
      </Alert>
    ) : null;

  if (startupConfig.chart) {
    return (
      <>
        {warning}
        <Box style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
          {startupConfig.chart === 'parallelcoordinates' ? (
            <ParallelCoordinates
              standalone
              initialUncertaintyColumns={uncertaintyColumns}
              hideTopBar={startupConfig.hideTopBar}
            />
          ) : (
            <CornerPlot standalone hideTopBar={startupConfig.hideTopBar} />
          )}
        </Box>
      </>
    );
  }

  return (
    <>
      {warning}
      <Group align={'flex-start'} wrap={'nowrap'}>
        <Box flex={1}>
          <Group align={'flex-start'}>
            <ParallelCoordinates />
            <CornerPlot />
          </Group>
        </Box>
        <Box w={300}>
          <SelectionList />
        </Box>
      </Group>
    </>
  );
}
