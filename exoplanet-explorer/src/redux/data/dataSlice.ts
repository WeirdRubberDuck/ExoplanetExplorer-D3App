import { createSlice } from "@reduxjs/toolkit";

// TODO: Move these types somewhere else
interface DataEntry {
  [key: string]: unknown;
}

interface DataState {
  // Data structures for full dataset, but with uncertainty data
  // Note that the ID of each planet corresponds to the index in these lists
  full: DataEntry[];

  // Just the uncertainty columns
  uncertainty?: DataEntry[];
}

const initialState: DataState = {
  full: [],
  uncertainty: [],
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    initializeData: (state, action) => {
      // Remove som non-interesting or problematic columns
      const columnsToRemove = [
        "rastr",
        "decstr",
        "ed_ESM",
        "sy_refname",
        "pl_refname",
        "st_refname",
        "dt_obj",
        "pl_rprs2",
        "tran_flag",
        "soltype",
        "disc_facility",
        "gaia_id",
        "pl_bmassprov",
        "default_flag",
        "ttv_flag",
      ];

      // Split the data into one part with the data values, and one with uncertainty
      // columns
      const fullData: DataEntry[] = [];
      const uncertaintyData: DataEntry[] = [];

      action.payload.forEach((item: DataEntry) => {
        const newEntry: DataEntry = {};
        const uncertaintyEntry: DataEntry = {};
        for (const key in item) {
          // Skip some columns completely
          if (
            key.endsWith("lim") ||
            // key.endsWith("apogee") || // for now, skip metallicity cols
            // key.endsWith("galah") || // for now, skip metallicity cols
            key.startsWith("molecule") || // and molecule columns
            columnsToRemove.includes(key)
          ) {
            continue;
          }
          // Handle uncertainty columns
          if (key.endsWith("err1") || key.endsWith("err2")) {
            uncertaintyEntry[key] = item[key];
            continue;
          }
          newEntry[key] = item[key];
        }

        fullData.push(newEntry);
        uncertaintyData.push(uncertaintyEntry);
      });

      state.full = fullData;
      state.uncertainty = uncertaintyData;
    },
  },
});

export const { initializeData } = dataSlice.actions;

export default dataSlice.reducer;
