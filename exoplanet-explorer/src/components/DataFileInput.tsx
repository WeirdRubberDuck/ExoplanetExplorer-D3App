import Papa from "papaparse";

import { FileInput } from "@mantine/core";
import { useAppDispatch } from "@/redux/hooks";
import { initializeData } from "@/redux/data/dataSlice";

// This is a temporary component to load the CSV data into the Redux store, from a
// local file. The data file must match the one used in OpenSpace
export function DataFileInput() {
  const dispatch = useAppDispatch();

  const loadCsvData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      // Parse CSV data
      const { data } = Papa.parse(csvData, {
        header: true, // Assuming the first row contains headers
        skipEmptyLines: true, // Skip empty lines
        dynamicTyping: true, // Automatically convert data types (string/number)
      });

      dispatch(initializeData(data));
    };
    reader.readAsText(file);
  };

  return (
    <FileInput
      label="Upload CSV"
      onChange={(file) => file && loadCsvData(file)}
      accept=".csv"
    />
  );
}
