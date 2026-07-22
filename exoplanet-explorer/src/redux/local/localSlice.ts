/**
 * Data related to the local state of the app.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  'st_age'
];

const cornerDefaultColumns: Column[] = [
  'pl_bmasse',
  'pl_rade',
  'pl_orbper',
  'pl_orbeccen',
  'pl_orbsmax',
  'pl_eqt',
  'st_met',
  'st_age'
];

interface LocalState {
  crossFiltering: {
    cornerAffectsParallel: boolean;
    parallelAffectsCorner: boolean;
  };
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
      showTextOnHighlightedLine: boolean;
      axisViolinPlots: {
        show: boolean;
        showMissingValueLobe: boolean;
      };
    };

    /**
     * IDs currently included by active parallel coordinates filters.
     * Undefined means no active filter. The ID corresponds to the index of the planet
     * in the data.full array.
     */
    filteredIds: number[] | undefined;
  };
  cornerPlot: {
    columnSelectionIsDefault: boolean;
    defaultColumns: Column[];
    settings: {
      selectedColumns: Column[];
      renderMode: 'scatter' | 'density';
      invertLayout: boolean;
    };
    filteredIds: number[] | undefined;
  };
  hoveredId: number | undefined;
  autoSyncOpenSpaceSelection: boolean;
  objectNameColumn: Column;
  logScaleColumns: Column[];
}

type ParallelCoordinatesSettings = LocalState['parallelCoordinates']['settings'];
type ParallelCoordinatesVisualSettings = Omit<
  ParallelCoordinatesSettings,
  'selectedColumns'
>;
type CornerPlotSettings = LocalState['cornerPlot']['settings'];
type CornerPlotVisualSettings = Omit<CornerPlotSettings, 'selectedColumns'>;

const initialState: LocalState = {
  crossFiltering: {
    cornerAffectsParallel: true,
    parallelAffectsCorner: true
  },
  parallelCoordinates: {
    columnSelectionIsDefault: true,
    settings: {
      selectedColumns: pcDefaultColumns,
      lineOpacity: 0.7,
      showGhostLines: true,
      showTextOnHighlightedLine: true,
      axisViolinPlots: {
        show: true,
        showMissingValueLobe: true
      }
    },
    columnOrder: pcDefaultColumns,
    defaultColumns: pcDefaultColumns,
    filteredIds: undefined
  },
  cornerPlot: {
    columnSelectionIsDefault: true,
    settings: {
      selectedColumns: cornerDefaultColumns,
      renderMode: 'scatter',
      invertLayout: true
    },
    defaultColumns: cornerDefaultColumns,
    filteredIds: undefined
  },
  hoveredId: undefined,
  autoSyncOpenSpaceSelection: false,
  objectNameColumn: 'pl_name',
  logScaleColumns: []
};

export const localSlice = createSlice({
  name: 'local',
  initialState,
  reducers: {
    setCrossFilteringSettings: (
      state,
      action: PayloadAction<Partial<LocalState['crossFiltering']>>
    ) => {
      state.crossFiltering = {
        ...state.crossFiltering,
        ...action.payload
      };
    },
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
      const incoming: number[] | undefined = action.payload;
      const current = state.parallelCoordinates.filteredIds;

      if (incoming === undefined && current === undefined) {
        return;
      }

      if (incoming === undefined || current === undefined) {
        state.parallelCoordinates.filteredIds = incoming;
        return;
      }

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
      state.parallelCoordinates.filteredIds = undefined;
    },
    setParallelCoordinatesSettings: (
      state,
      action: PayloadAction<Partial<ParallelCoordinatesVisualSettings>>
    ) => {
      const patch = action.payload;

      if (patch.lineOpacity !== undefined) {
        state.parallelCoordinates.settings.lineOpacity = patch.lineOpacity;
      }

      if (patch.showGhostLines !== undefined) {
        state.parallelCoordinates.settings.showGhostLines = patch.showGhostLines;
      }

      if (patch.showTextOnHighlightedLine !== undefined) {
        state.parallelCoordinates.settings.showTextOnHighlightedLine =
          patch.showTextOnHighlightedLine;
      }

      if (patch.axisViolinPlots !== undefined) {
        state.parallelCoordinates.settings.axisViolinPlots = {
          ...state.parallelCoordinates.settings.axisViolinPlots,
          ...patch.axisViolinPlots
        };
      }
    },

    setCornerPlotSelectedColumns: (state, action: PayloadAction<Column[]>) => {
      const newColumns = action.payload;
      state.cornerPlot.settings.selectedColumns = newColumns;
      state.cornerPlot.columnSelectionIsDefault = isSameColumnArray(
        newColumns,
        state.cornerPlot.defaultColumns
      );
    },
    resetCornerPlotColumns: (state) => {
      state.cornerPlot.settings.selectedColumns = state.cornerPlot.defaultColumns;
      state.cornerPlot.columnSelectionIsDefault = true;
      state.cornerPlot.filteredIds = undefined;
    },
    setCornerPlotFilteredIds: (state, action: PayloadAction<number[] | undefined>) => {
      const incoming = action.payload;
      const current = state.cornerPlot.filteredIds;

      if (incoming === undefined && current === undefined) {
        return;
      }

      if (incoming === undefined || current === undefined) {
        state.cornerPlot.filteredIds = incoming;
        return;
      }

      const isSame =
        current.length === incoming.length &&
        current.every((id, index) => id === incoming[index]);

      if (isSame) {
        return;
      }

      state.cornerPlot.filteredIds = incoming;
    },
    setCornerPlotSettings: (
      state,
      action: PayloadAction<Partial<CornerPlotVisualSettings>>
    ) => {
      const patch = action.payload;

      if (patch.renderMode !== undefined) {
        state.cornerPlot.settings.renderMode = patch.renderMode;
      }

      if (patch.invertLayout !== undefined) {
        state.cornerPlot.settings.invertLayout = patch.invertLayout;
      }
    },

    setHoveredItemId: (state, action) => {
      state.hoveredId = action.payload;
    },
    setAutoSyncOpenSpaceSelection: (state, action) => {
      state.autoSyncOpenSpaceSelection = action.payload;
    },
    setObjectNameColumn: (state, action) => {
      state.objectNameColumn = action.payload;
    },
    setLogScaleColumns: (state, action) => {
      state.logScaleColumns = action.payload;
    }
  }
});

export const {
  setCrossFilteringSettings,

  setParallelCoordinatesSelectedColumns,
  setParallelCoordinatesColumnOrder,
  setParallelCoordinatesFilteredIds,
  resetParallelCoordinates,
  setParallelCoordinatesSettings,

  setCornerPlotSelectedColumns,
  resetCornerPlotColumns,
  setCornerPlotFilteredIds,
  setCornerPlotSettings,

  setHoveredItemId,
  setAutoSyncOpenSpaceSelection,
  setObjectNameColumn,
  setLogScaleColumns
} = localSlice.actions;

export default localSlice.reducer;
