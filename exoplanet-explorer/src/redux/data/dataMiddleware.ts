import type { AppStartListening } from "@/services/redux/listenerMiddleware";

import { initializeData } from "./dataSlice";

export const addDataListener = (startListening: AppStartListening) => {
  startListening({
    actionCreator: initializeData,
    effect: async (_, listenerApi) => {
      // For now just log the data to confirm it's being stored correctly. In the future,
      // we can use this listener to trigger any additional processing we want to do on
      // the data after it's loaded
      console.log(
        "Data initialized in Redux store:",
        listenerApi.getState().data.full,
        listenerApi.getState().data.uncertainty,
      );
    },
  });
};
