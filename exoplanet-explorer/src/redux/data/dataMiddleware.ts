import { createAsyncThunk } from '@reduxjs/toolkit';

import { api } from '@/api/api';
import { onOpenConnection } from '@/redux/connection/connectionSlice';
import type { AppStartListening } from '@/redux/listenerMiddleware';

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
  }
);

export const addDataListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: initializeData,
    effect: async (_, listenerApi) => {
      // For now just log the data to confirm it's being stored correctly. In the future,
      // we can use this listener to trigger any additional processing we want to do on
      // the data after it's loaded
      console.log(
        'Data initialized in Redux store:',
        listenerApi.getState().data.full,
        listenerApi.getState().data.uncertainty
      );
    }
  });

  startListening({
    actionCreator: onOpenConnection,
    effect: async (_, listenerApi) => {
      listenerApi.dispatch(setupPropertySubscriptions());
    }
  });
};
