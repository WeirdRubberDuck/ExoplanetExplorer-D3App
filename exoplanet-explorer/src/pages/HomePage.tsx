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

// OpenSpace serves the data on its websocket port.
const openSpaceDataPath = 'exoplanetexplorer/data/aggregated_data.json';

const dataUrl = import.meta.env.DEV
  ? `/openspace/${openSpaceDataPath}`
  : `http://localhost:4680/${openSpaceDataPath}`;

// If we can't access the data from the OpenSpace server, use the local fallback URL.
// This dataset will not be up to date compared to the OpenSpace server.
const fallbackDataUrl = new URL('../data/aggregated_data.json', import.meta.url).href;

interface PageInitialization {
  warnings: string[];
  uncertaintyColumns: string[];
}

let initialization: Promise<PageInitialization> | undefined;

async function fetchPlanetData(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load planet data (${response.status}).`);
  try {
    return await response.json();
  } catch {
    throw new Error(
      `Could not load planet data: response from ${url} is not valid JSON.`
    );
  }
}

function initializePage() {
  initialization ??= (async () => {
    let planetData;
    let usedFallback = false;
    try {
      planetData = await fetchPlanetData(dataUrl);
    } catch {
      planetData = await fetchPlanetData(fallbackDataUrl);
      usedFallback = true;
    }
    store.dispatch(initializeData(planetData));

    const warnings = [...startupConfig.warnings];
    if (usedFallback) {
      warnings.unshift(
        'OpenSpace data could not be loaded; using the bundled dataset, which may be outdated.'
      );
    }
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
  const [warningsDismissed, setWarningsDismissed] = useState(false);

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
      <Alert
        color={'red'}
        title={'Data loading failed'}
        withCloseButton
        onClose={() => setError(undefined)}
      >
        {error}
      </Alert>
    );

  if (!pageInitialization) {
    return <Loader aria-label={'Loading planet data'} />;
  }

  const { warnings, uncertaintyColumns } = pageInitialization;

  const warning =
    warnings.length > 0 && !warningsDismissed ? (
      <Alert
        color={'yellow'}
        mb={'sm'}
        title={'Startup warnings'}
        withCloseButton
        onClose={() => setWarningsDismissed(true)}
      >
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
