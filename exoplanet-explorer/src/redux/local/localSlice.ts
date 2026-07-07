/**
 * Data related to the local state of the app.
 */

import { createSlice } from '@reduxjs/toolkit';

import { isSameColumnArray } from '@/features/ParallelCoordinates/util';
import type { Column } from '@/types/types';

const pcDefaultColumns: Column[] = [
  'discoverymethod',
  'sy_pnum',
  'pl_bmasse',
  'pl_rade',
  'pl_orbincl',
  'pl_Teq',
  'sy_dist',
  'st_spectype',
  'st_age'
];

interface LocalState {
  parallelCoordinates: {
    /**
     * Whether the column selection is currently the default selection. This is used to
     * determine whether to show the "Reset to default" button in the column selection UI.
     */
    columnSelectionIsDefault: boolean;

    /**
     * The order of the columns in the parallel coordinates chart. This is separate from
     * the order in the data.columns because the user can reorder them in the graph.
     */
    columnOrder: Column[];

    /**
     * Default columns to show in the parallel coordinates chart.
     */
    defaultColumns: Column[];

    settings: {
      selectedColumns: Column[];
      lineOpacity: number;
      showGhostLines: boolean;
    };

    /**
     * IDs currently included by active parallel coordinates filters.
     * Empty list means no active filter. The ID corresponds to the index of the planet
     * in the data.full array.
     */
    filteredIds: number[];
  };
}

const initialState: LocalState = {
  parallelCoordinates: {
    columnSelectionIsDefault: true,
    settings: {
      selectedColumns: pcDefaultColumns,
      lineOpacity: 0.7,
      showGhostLines: true
    },
    columnOrder: pcDefaultColumns,
    defaultColumns: pcDefaultColumns,
    filteredIds: []
  }
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    setParallelCoordinatesSelectedColumns: (state, action) => {
      const newColumns: Column[] = action.payload;
      state.parallelCoordinates.settings.selectedColumns = newColumns;

      const columnSelectionIsDefault = isSameColumnArray(
        newColumns,
        state.parallelCoordinates.defaultColumns
      );
      state.parallelCoordinates.columnSelectionIsDefault = columnSelectionIsDefault;

      const newColumnOrder = state.parallelCoordinates.columnOrder.filter((col: Column) =>
        newColumns.includes(col)
      );
      // Add any newly selected columns to the end of the column order
      newColumns.forEach((col) => {
        if (!newColumnOrder.includes(col)) {
          newColumnOrder.push(col);
        }
      });

      // Removedeselected columns from the column order
      if (!isSameColumnArray(state.parallelCoordinates.columnOrder, newColumnOrder)) {
        state.parallelCoordinates.columnOrder = newColumnOrder;
      }
    },
    setParallelCoordinatesColumnOrder: (state, action) => {
      state.parallelCoordinates.columnOrder = action.payload;
    },
    setParallelCoordinatesFilteredIds: (state, action) => {
      const incoming: number[] = action.payload;
      const current = state.parallelCoordinates.filteredIds;

      const isSame =
        current.length === incoming.length &&
        current.every((id, index) => id === incoming[index]);
      if (isSame) {
        return;
      }

      state.parallelCoordinates.filteredIds = incoming;
    },
    resetParallelCoordinates: (state) => {
      state.parallelCoordinates.settings.selectedColumns =
        state.parallelCoordinates.defaultColumns;
      state.parallelCoordinates.columnOrder = state.parallelCoordinates.defaultColumns;
      state.parallelCoordinates.columnSelectionIsDefault = true;
      state.parallelCoordinates.filteredIds = [];
    },
    setParallelCoordinatesLineOpacity: (state, action) => {
      state.parallelCoordinates.settings.lineOpacity = action.payload;
    },
    setParallelCoordinatesShowGhostLines: (state, action) => {
      state.parallelCoordinates.settings.showGhostLines = action.payload;
    }
  }
});

export const {
  setParallelCoordinatesSelectedColumns,
  setParallelCoordinatesColumnOrder,
  setParallelCoordinatesFilteredIds,
  resetParallelCoordinates,
  setParallelCoordinatesLineOpacity,
  setParallelCoordinatesShowGhostLines
} = localSlice.actions;

export default localSlice.reducer;
