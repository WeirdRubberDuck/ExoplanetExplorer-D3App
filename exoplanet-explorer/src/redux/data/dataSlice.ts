import { createSlice } from '@reduxjs/toolkit';

import type { Column, ColumnData, DataItem, UncertaintyDataItem } from '@/types/types';
import { hasValue } from '@/utils/util';

interface DataState {
  // Data structures for full dataset, but with uncertainty data
  // Note that the ID of each planet corresponds to the index in these lists
  full: DataItem[];
  columns: Column[];
  columnData: Record<Column, ColumnData>;

  // Just the uncertainty columns
  uncertainty: UncertaintyDataItem[];
  // Uncertainty domains for each column (in percentage)
  uncertaintyDomains: Record<Column, { min: number; max: number }>;

  // Number of planets currently included in OpenSpace's filtered rows property
  filteredPlanetsFromOpenSpace: number[] | undefined;
}

const initialState: DataState = {
  full: [],
  columns: [],
  columnData: {},
  uncertainty: [],
  uncertaintyDomains: {},
  filteredPlanetsFromOpenSpace: undefined
};

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    initializeData: (state, action) => {
      // Split the data into one part with the data values, and one with uncertainty
      // columns
      const fullData: DataItem[] = [];
      const uncertaintyData: UncertaintyDataItem[] = [];

      action.payload.forEach((item: DataItem, index: number) => {
        const newEntry: DataItem = { id: index };
        const uncertaintyEntry: UncertaintyDataItem = {};
        for (const key in item) {
          // Skip some columns completely
          if (key.endsWith('lim')) {
            continue;
          }
          // Handle uncertainty columns
          if (key.endsWith('err1') || key.endsWith('err2')) {
            const baseKey = key.slice(0, -4);
            const value = hasValue(item[key]) ? Number(item[key]) : null;

            // TODO: Compute the absolute uncertainty range (in percentage) not just the upper and lower bounds
            if (key.endsWith('err1')) {
              uncertaintyEntry[baseKey] = {
                ...uncertaintyEntry[baseKey],
                lower: value
              };
            } else {
              uncertaintyEntry[baseKey] = {
                ...uncertaintyEntry[baseKey],
                upper: value
              };
            }
          }
          newEntry[key] = item[key];
        }

        // Compute percentage uncertainty for each column that has both upper and lower
        // bounds. keep track of the domains
        for (const col in uncertaintyEntry) {
          const value = hasValue(item[col]) ? Number(item[col]) : null;

          const { upper, lower } = uncertaintyEntry[col];
          if (value !== null && lower !== null && upper !== null) {
            const percentage =
              (100.0 * (Math.abs(upper) + Math.abs(lower))) / Math.abs(value);
            uncertaintyEntry[col].percentage = percentage;

            state.uncertaintyDomains[col] = {
              min: Math.min(state.uncertaintyDomains[col]?.min ?? Infinity, percentage),
              max: Math.max(state.uncertaintyDomains[col]?.max ?? -Infinity, percentage)
            };
          }
        }

        fullData.push(newEntry);
        uncertaintyData.push(uncertaintyEntry);
      });

      state.full = fullData;
      state.uncertainty = uncertaintyData;

      state.columns = Object.keys(fullData[0] || {}).filter((col) => col !== 'id');
      state.columnData = {};

      for (const key of state.columns) {
        const values = fullData
          .map((d) => d[key])
          .filter((v): v is string | number => {
            if (v == null) {
              return false;
            }

            if (typeof v === 'string') {
              return v.trim() !== '';
            }

            return true;
          });

        const numericValues = values
          .map((v) => Number(v))
          .filter((v): v is number => Number.isFinite(v));

        const MIN_NUMERIC_SAMPLE_SIZE = 5;
        const numericRatio =
          values.length === 0 ? 0 : numericValues.length / values.length;
        const isNumeric = values.length >= MIN_NUMERIC_SAMPLE_SIZE && numericRatio > 0.8;

        if (isNumeric) {
          state.columnData[key] = {
            type: 'number',
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            isUncertainty: key.endsWith('err1') || key.endsWith('err2')
          };
        } else {
          const categories = Array.from(new Set(values.map((v) => String(v))));
          state.columnData[key] = { type: 'string', categories };
        }
      }
    },
    setFilteredPlanetsFromOpenSpace: (state, action) => {
      state.filteredPlanetsFromOpenSpace = action.payload;
    }
  }
});

export const { initializeData, setFilteredPlanetsFromOpenSpace } = dataSlice.actions;

export default dataSlice.reducer;
