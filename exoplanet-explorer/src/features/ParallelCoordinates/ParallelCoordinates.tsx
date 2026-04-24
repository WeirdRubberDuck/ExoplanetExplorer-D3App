import { useState } from 'react';
import { Box, Checkbox, Slider, Stack, Text, Title } from '@mantine/core';
import { useResizeObserver, useViewportSize } from '@mantine/hooks';

import { ParallelCoordinatesChart } from './Chart.tsx';
import { dymmyData } from './dummydata.ts'; // TODO: Replace with actual data
import type { DataItem } from './types.ts';

export function ParallelCoordinates() {
  const [lineOpacity, setLineOpacity] = useState(0.7);
  const [shouldShadowLines, setShadowLines] = useState(false);
  const [showGhostLines, setGhostLines] = useState(true);

  const [containerRef, container] = useResizeObserver();
  const { height } = useViewportSize();

  return (
    <>
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
          data={dymmyData as DataItem[]}
          width={container ? container.width : 400}
          height={container ? container.height : 400}
          cfg={{
            lineOpacity,
            shadowLines: shouldShadowLines,
            showGhostLines: showGhostLines
          }}
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
