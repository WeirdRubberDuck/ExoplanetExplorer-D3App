import { useState } from 'react';
import { Box, Button, Checkbox, Group, Slider, Stack, Text, Title } from '@mantine/core';
import { useResizeObserver, useViewportSize } from '@mantine/hooks';

import { ParallelCoordinatesChart } from './Chart.tsx';
import { dummyData } from './dummydata.ts'; // TODO: Replace with actual data
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
  const [shouldShadowLines, setShadowLines] = useState(false);
  const [showGhostLines, setGhostLines] = useState(true);
  const [chartRenderKey, setChartRenderKey] = useState(0);

  const [containerRef, container] = useResizeObserver();
  const { height } = useViewportSize();

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
          height: 800,
          maxHeight: height,
          minHeight: 200,
          overflow: 'hidden'
        }}
        ref={containerRef}
      >
        <ParallelCoordinatesChart
          key={chartRenderKey}
          data={dummyData as DataItem[]}
          filteredData={filteredData}
          width={container ? container.width : 400}
          height={container ? container.height : 400}
          cfg={{
            lineOpacity,
            shadowLines: shouldShadowLines,
            showGhostLines: showGhostLines
          }}
          handleBrush={handleBrush}
          handleBrushClear={handleBrushClear}
          handleNanBrush={handleNanBrush}
          columns={pcDefaultColumns}
        />
      </Box>
      <Box w={300} p={'md'}>
        <Stack>
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
            label={'Shadow lines (slows down interaction)'}
            checked={shouldShadowLines}
            onChange={(e) => setShadowLines(e.target.checked)}
          />
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
