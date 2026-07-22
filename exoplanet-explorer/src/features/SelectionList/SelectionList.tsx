import { useMemo, useState } from 'react';
import { Box, Paper, Text, Title } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';

import { useBaseDataset, useFilteredIds } from '@/hooks/data';
import type { DataItem } from '@/types/types';

import { PlanetListItem } from './PlanetListItem';

export function SelectionList() {
  const [scrollTop, setScrollTop] = useState(0);

  const { filteredIds } = useFilteredIds();
  const data = useBaseDataset();

  const [ref, rect] = useResizeObserver();

  const defaultHeight = 800; // Default height if rect is not available
  const rowHeight = 30;
  const listHeight = rect?.height ?? defaultHeight;
  const overscan = 6;

  const idsToRender = useMemo(() => {
    if (filteredIds === undefined) {
      return data.map((row) => row.id);
    }

    return filteredIds;
  }, [filteredIds, data]);

  const visibleRowCount = Math.ceil(listHeight / rowHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    idsToRender.length,
    startIndex + visibleRowCount + overscan * 2
  );
  const visibleRows = idsToRender.slice(startIndex, endIndex);
  const yOffset = startIndex * rowHeight;
  const totalHeight = idsToRender.length * rowHeight;

  return (
    <Paper p={'xs'}>
      <Title order={4}>{`Planets (${idsToRender.length})`}</Title>

      {idsToRender.length === 0 ? (
        <Text size={'sm'} c={'dimmed'} mt={'xs'}>
          No rows matched the current filter.
        </Text>
      ) : (
        <Box
          mt={'xs'}
          h={defaultHeight}
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
              {visibleRows.map((id: DataItem['id']) => (
                <PlanetListItem key={id} id={id} />
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
