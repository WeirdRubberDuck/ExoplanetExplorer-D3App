import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./data/dataSlice";
import { listenerMiddleware } from "./listenerMiddleware";
import { connectionReducer } from "./connection/connectionSlice";

export const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([listenerMiddleware.middleware]),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
