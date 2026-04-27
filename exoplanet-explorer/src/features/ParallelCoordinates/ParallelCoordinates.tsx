import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Skeleton,
  Slider,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useResizeObserver, useViewportSize } from '@mantine/hooks';

import { data as dummyData } from '@/public/dummydata.ts'; // TODO: Replace with actual data

import { ParallelCoordinatesChart } from './Chart.tsx';
import { useBrushing } from './hooks.ts';
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
  const { clearBrushes, handleBrush, handleBrushClear, handleNanBrush, filteredData } =
    useBrushing(dummyData as DataItem[]);

  const [lineOpacity, setLineOpacity] = useState(0.7);
  const [showGhostLines, setGhostLines] = useState(true);
  const [chartRenderKey, setChartRenderKey] = useState(0);

  const [containerRef, container] = useResizeObserver();
  const { height } = useViewportSize();

  const fallbackHeight = 400;
  const computedHeight = height > 0 ? 0.5 * height : fallbackHeight;

  const handleResetFilter = () => {
    clearBrushes();
    // Force re-render to clear brushes
    setChartRenderKey((current) => current + 1);
  };

  return (
    <>
      <Group>
        <Button onClick={handleResetFilter}>Reset filter</Button>
        <Group gap={5}>
          <Text size={'md'} fw={500}>
            {filteredData.length}{' '}
          </Text>
          <Text size={'xs'} c={'dimmed'}>
            / {dummyData.length} planets shown
          </Text>
        </Group>
      </Group>
      <Box
        style={{
          resize: 'vertical',
          height: computedHeight,
          maxHeight: height > 0 ? height : fallbackHeight,
          minHeight: 200,
          overflow: 'hidden'
        }}
        ref={containerRef}
      >
        {container?.height ? (
          <ParallelCoordinatesChart
            key={chartRenderKey}
            data={dummyData as DataItem[]}
            filteredData={filteredData}
            width={container ? container.width : 400}
            height={container ? container.height : computedHeight}
            cfg={{
              lineOpacity,
              showGhostLines: showGhostLines
            }}
            handleBrush={handleBrush}
            handleBrushClear={handleBrushClear}
            handleNanBrush={handleNanBrush}
            columns={pcDefaultColumns}
          />
        ) : (
          <Skeleton height={computedHeight} />
        )}
      </Box>
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
        </Stack>
      </Box>
    </>
  );
}
