import { configureStore } from '@reduxjs/toolkit';

import { startupConfig } from '@/utils/urlConfig';

import { connectionReducer } from './connection/connectionSlice';
import { dataSlice } from './data/dataSlice';
import { localSlice, setAutoSyncOpenSpaceSelection } from './local/localSlice';
import { listenerMiddleware } from './listenerMiddleware';

export const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
    connection: connectionReducer,
    local: localSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([listenerMiddleware.middleware])
});

if (startupConfig.autoSync !== undefined) {
  store.dispatch(setAutoSyncOpenSpaceSelection(startupConfig.autoSync));
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
