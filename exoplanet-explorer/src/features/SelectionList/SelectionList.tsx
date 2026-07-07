import { useState } from 'react';
import { Box, Paper, Text, Title } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';

import { useAppSelector } from '@/redux/hooks';

export function SelectionList() {
  const [scrollTop, setScrollTop] = useState(0);

  const filteredIds = useAppSelector(
    (state) => state.local.parallelCoordinates.filteredIds
  );
  const fullData = useAppSelector((state) => state.data.full);

  const [ref, rect] = useResizeObserver();

  const rowHeight = 30;
  const listHeight = rect?.height ?? 300;
  const overscan = 6;

  const visibleRowCount = Math.ceil(listHeight / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    filteredIds.length,
    startIndex + visibleRowCount + overscan * 2
  );
  const visibleRows = filteredIds.slice(startIndex, endIndex);
  const yOffset = startIndex * rowHeight;
  const totalHeight = filteredIds.length * rowHeight;

  return (
    <Paper withBorder p={'md'} mt={'md'}>
      <Title order={4}>Filtered Planets ({filteredIds.length})</Title>

      {filteredIds.length === 0 ? (
        <Text size={'sm'} c={'dimmed'} mt={'xs'}>
          No active filter.
        </Text>
      ) : filteredIds.length === 0 ? (
        <Text size={'sm'} c={'dimmed'} mt={'xs'}>
          No rows matched the current filtered IDs.
        </Text>
      ) : (
        <Box
          mt={'xs'}
          h={400} // Default height
          style={{
            height: listHeight,
            overflowY: 'auto',
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 4,
            resize: 'vertical'
          }}
          ref={ref}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <Box style={{ height: totalHeight, position: 'relative' }}>
            <Box style={{ transform: `translateY(${yOffset}px)` }}>
              {visibleRows.map((id) => (
                <Text key={id} size={'sm'} px={'xs'} py={2}>
                  {fullData[id]?.pl_name}
                </Text>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
