import {
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";

import type { AppDispatch, RootState } from "./store";
import { addDataListener } from "./data/dataMiddleware";

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

addDataListener(startAppListening);
