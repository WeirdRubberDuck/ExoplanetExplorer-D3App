import { useState } from 'react';
import { Box, Checkbox, Slider, Stack, Text, Title } from '@mantine/core';

import { data as dummyData } from '@/public/dummydata.ts'; // TODO: Replace with actual data

import { ParallelCoordinatesChart } from './Chart.tsx';
import { ColumnSelection } from './ColumnSelection.tsx';
import type { DataItem } from './types.ts';

const pcDefaultColumns = [
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

export function ParallelCoordinates() {
  const [lineOpacity, setLineOpacity] = useState(0.7);
  const [showGhostLines, setGhostLines] = useState(true);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(pcDefaultColumns);

  return (
    <>
      <ParallelCoordinatesChart
        data={dummyData as DataItem[]}
        defaultHeight={400}
        maxHeight={1000}
        cfg={{
          lineOpacity,
          showGhostLines: showGhostLines
        }}
        columns={selectedColumns}
      />
      <Box w={300} p={'md'}>
        <Stack gap={'xs'}>
          <Title order={2}>Settings</Title>
          <Box>
            <Text>Line opacity</Text>
            <Slider
              value={lineOpacity}
              onChange={setLineOpacity}
              min={0}
              max={1}
              step={0.01}
            />
          </Box>
          <Checkbox
            label={'Show ghost lines for filtered out paths'}
            checked={showGhostLines}
            onChange={(e) => setGhostLines(e.target.checked)}
          />
          <ColumnSelection
            columns={dummyData.length > 0 ? Object.keys(dummyData[0]) : []}
            primaryColumns={pcDefaultColumns}
            defaultSelection={selectedColumns}
            onSelectionChange={setSelectedColumns}
          />
        </Stack>
      </Box>
    </>
  );
}
