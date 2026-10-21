import { createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';

import { api } from '@/api/api';
import { onOpenConnection } from '@/redux/connection/connectionSlice';
import type { AppStartListening } from '@/redux/listenerMiddleware';
import {
  initializeDatasetColumns,
  resetCornerPlotColumns,
  resetParallelCoordinates,
  setCornerPlotSelectedColumns,
  setHoveredItemId,
  setLogScaleColumns,
  setObjectNameColumn,
  setParallelCoordinatesColumnOrder,
  setParallelCoordinatesSelectedColumns
} from '@/redux/local/localSlice';
import { readColumnPreferences, writeColumnPreferences } from '@/utils/columnPreferences';
import { resolveDatasetColumns } from '@/utils/datasetColumns';

import { initializeData, setFilteredPlanetsFromOpenSpace } from './dataSlice';

export const setupPropertySubscriptions = createAsyncThunk(
  'data/setupPropertySubscriptions',
  async (_, thunkApi) => {
    // Subscribe to all the relevant OpenSpace properties we want to listen to here

    // Filtered data rows from OpenSpace's ExoplanetExplorer UI
    const subscription = api.subscribeToProperty(
      'Modules.ExoplanetsExpertTool.FilteredDataRows'
    );
    (async () => {
      for await (const data of subscription) {
        if (data && data.type === 'value') {
          thunkApi.dispatch(setFilteredPlanetsFromOpenSpace(data.value));
        }
      }
    })();

    const hoverSubscription = api.subscribeToProperty(
      'Modules.ExoplanetsExpertTool.HoveredIndex'
    );
    (async () => {
      for await (const data of hoverSubscription) {
        if (data && data.type === 'value') {
          const { value } = data;
          if (typeof value === 'number' && Number.isInteger(value) && value >= -1) {
            thunkApi.dispatch(setHoveredItemId(value === -1 ? undefined : value));
          }
        }
      }
    })();
  }
);

export const addDataListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: initializeData,
    effect: (_, listenerApi) => {
      const { columns, columnData, datasetKey } = listenerApi.getState().data;
      listenerApi.dispatch(
        initializeDatasetColumns(
          resolveDatasetColumns(columns, columnData, readColumnPreferences(datasetKey))
        )
      );
    }
  });

  // Listen for changes to local column preferences and persist them to local storage
  startListening({
    matcher: isAnyOf(
      setParallelCoordinatesSelectedColumns,
      setParallelCoordinatesColumnOrder,
      setCornerPlotSelectedColumns,
      setLogScaleColumns,
      setObjectNameColumn,
      resetParallelCoordinates,
      resetCornerPlotColumns
    ),
    effect: (_, listenerApi) => {
      const { data, local } = listenerApi.getState();
      if (!data.datasetKey) {
        return;
      }
      writeColumnPreferences(data.datasetKey, {
        logScaleColumns: local.logScaleColumns,
        objectNameColumn: local.objectNameColumn,
        parallelCoordinates: {
          selectedColumns: local.parallelCoordinates.settings.selectedColumns,
          columnOrder: local.parallelCoordinates.columnOrder
        },
        cornerPlot: { selectedColumns: local.cornerPlot.settings.selectedColumns }
      });
    }
  });

  startListening({
    actionCreator: onOpenConnection,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(setupPropertySubscriptions());
    }
  });
};
