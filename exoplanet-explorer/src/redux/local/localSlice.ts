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
     * The columns currently selected to be shown in the parallel coordinates chart.
     */
    selectedColumns: Column[];
    /**
     * The order of the columns in the parallel coordinates chart. This is separate from
     * the order in the data.columns because the user can reorder them in the graph.
     */
    columnOrder: Column[];
    /**
     * Default columns to show in the parallel coordinates chart.
     */
    defaultColumns: Column[];
  };
}

const initialState: LocalState = {
  parallelCoordinates: {
    columnSelectionIsDefault: true,
    selectedColumns: pcDefaultColumns,
    columnOrder: pcDefaultColumns,
    defaultColumns: pcDefaultColumns
  }
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    setParallelCoordinatesSelectedColumns: (state, action) => {
      const newColumns: Column[] = action.payload;
      state.parallelCoordinates.selectedColumns = newColumns;

      const columnSelectionIsDefault = isSameColumnArray(
        newColumns,
        state.parallelCoordinates.defaultColumns
      );
      state.parallelCoordinates.columnSelectionIsDefault = columnSelectionIsDefault;

      const newColumnOrder = state.parallelCoordinates.columnOrder.filter((col) =>
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
    resetParallelCoordinates: (state) => {
      state.parallelCoordinates.selectedColumns =
        state.parallelCoordinates.defaultColumns;
      state.parallelCoordinates.columnOrder = state.parallelCoordinates.defaultColumns;
      state.parallelCoordinates.columnSelectionIsDefault = true;
    }
  }
});

export const {
  setParallelCoordinatesSelectedColumns,
  setParallelCoordinatesColumnOrder,
  resetParallelCoordinates
} = localSlice.actions;

export default localSlice.reducer;
