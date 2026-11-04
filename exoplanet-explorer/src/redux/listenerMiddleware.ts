import {
  createListenerMiddleware,
  type TypedStartListening,
} from "@reduxjs/toolkit";

import { addConnectionListener } from "./connection/connectionMiddleware";
import { addDataListener } from "./data/dataMiddleware";
import type { AppDispatch, RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

addDataListener(startAppListening);
addConnectionListener(startAppListening);
