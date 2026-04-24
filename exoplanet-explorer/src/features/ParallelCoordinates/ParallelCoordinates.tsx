import { Box } from '@mantine/core';
import { useResizeObserver, useViewportSize } from '@mantine/hooks';

import { ParallelCoordinatesChart } from './Chart.tsx';
import { dymmyData } from './dummydata.ts'; // TODO: Replace with actual data
import type { DataItem } from './types.ts';

export function ParallelCoordinates() {
  const [containerRef, container] = useResizeObserver();

  const { height } = useViewportSize();

  return (
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
      />
    </Box>
  );
}
