import { useState } from 'react';
import { FileInput, Group, Text, Tooltip } from '@mantine/core';
import Papa from 'papaparse';

import { initializeData } from '@/redux/data/dataSlice';
import { useAppDispatch } from '@/redux/hooks';
import type { Value } from '@/types/types';

// This is a temporary component to load the CSV data into the Redux store, from a
// local file. The data file must match the one used in OpenSpace
export function DataFileInput() {
  const dispatch = useAppDispatch();
  const [fileName, setFileName] = useState<string | null>(null);

  const loadCsvData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      // Parse CSV data
      const { data } = Papa.parse<Record<string, Value>>(csvData, {
        comments: '#', // Ignore lines starting with '#'
        header: true, // Assuming the first row contains headers
        skipEmptyLines: true, // Skip empty lines
        dynamicTyping: true // Automatically convert data types (string/number)
      });

      dispatch(initializeData({ rows: data, source: { kind: 'file', name: file.name } }));
    };
    reader.readAsText(file);
  };

  return (
    <Group gap={'xs'}>
      <Text size={'sm'}>Load CSV:</Text>
      <Tooltip label={fileName ?? 'Click to upload a CSV file'}>
        <FileInput
          aria-label={'Upload CSV'}
          onChange={(file) => {
            if (file) {
              setFileName(file.name);
              loadCsvData(file);
            }
          }}
          accept={'.csv'}
          w={100}
        />
      </Tooltip>
    </Group>
  );
}
