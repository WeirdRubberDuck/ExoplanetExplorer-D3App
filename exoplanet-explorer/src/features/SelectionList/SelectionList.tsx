import { useState } from 'react';
import { Box, Paper, Text, Title } from '@mantine/core';

import { useAppSelector } from '@/redux/hooks';

export function SelectionList() {
  const [scrollTop, setScrollTop] = useState(0);

  const filteredIds = useAppSelector(
    (state) => state.local.parallelCoordinates.filteredIds
  );
  const fullData = useAppSelector((state) => state.data.full);

  const rowHeight = 30;
  const listHeight = 320;
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
      <Title order={4}>Filtered Planet Names</Title>

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
          style={{
            height: listHeight,
            overflowY: 'auto',
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 4
          }}
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
