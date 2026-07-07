import { useMemo } from 'react';
import { List, Paper, Text, Title } from '@mantine/core';

import { useAppSelector } from '@/redux/hooks';

export function SelectionList() {
  const filteredIds = useAppSelector(
    (state) => state.local.parallelCoordinates.filteredIds
  );
  const fullData = useAppSelector((state) => state.data.full);

  const filteredRows = useMemo(() => {
    if (filteredIds.length === 0) {
      return [];
    }

    const idSet = new Set(filteredIds);
    return fullData.filter((row) => idSet.has(row.id));
  }, [fullData, filteredIds]);

  return (
    <Paper withBorder p={'md'} mt={'md'}>
      <Title order={4}>Filtered Planet Names</Title>

      {filteredIds.length === 0 ? (
        <Text size={'sm'} c={'dimmed'} mt={'xs'}>
          No active filter.
        </Text>
      ) : filteredRows.length === 0 ? (
        <Text size={'sm'} c={'dimmed'} mt={'xs'}>
          No rows matched the current filtered IDs.
        </Text>
      ) : (
        <List size={'sm'} mt={'xs'} spacing={'xs'}>
          {filteredRows.map((row) => (
            <List.Item key={row.id}>
              {typeof row.pl_name === 'string' && row.pl_name.trim() !== ''
                ? row.pl_name
                : `Unnamed planet (${row.id})`}
            </List.Item>
          ))}
        </List>
      )}
    </Paper>
  );
}
