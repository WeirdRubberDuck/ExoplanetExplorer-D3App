import { useMemo, useState } from 'react';
import { IoMdSettings } from 'react-icons/io';
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  Group,
  Slider,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import { resetParallelCoordinates } from '@/redux/local/localSlice.ts';
import type { DataItem } from '@/types/types.ts';

import { ParallelCoordinatesChart } from './Chart.tsx';
import { ColumnSelection } from './ColumnSelection.tsx';

export function ParallelCoordinates() {
  const [lineOpacity, setLineOpacity] = useState(0.7);
  const [showGhostLines, setGhostLines] = useState(true);

  const { full: data, columns, uncertainty } = useAppSelector((state) => state.data);
  const { columnSelectionIsDefault, selectedColumns, defaultColumns } = useAppSelector(
    (state) => state.local.parallelCoordinates
  );

  const [settingsOpened, { open, close }] = useDisclosure(false);

  const dispatch = useAppDispatch();

  // Collect the data for the parallel coordinates chart based on the selected columns
  // and the uncertainty data. We need nothing more
  const pcData = useMemo(() => {
    return data.map((item) => {
      const newItem: DataItem = { id: item.id };
      selectedColumns.forEach((col) => {
        newItem[col] = item[col];
        if (uncertainty[item.id] && uncertainty[item.id][col]) {
          newItem[`${col}_err`] = uncertainty[item.id][col].percentage ?? null;
        }
      });
      return newItem;
    });
  }, [data, selectedColumns, uncertainty]);

  return (
    <>
      <Group mb={'xs'}>
        <Button leftSection={<IoMdSettings />} variant={'default'} onClick={open}>
          Settings
        </Button>
        <Button
          variant={'default'}
          onClick={() => dispatch(resetParallelCoordinates())}
          disabled={columnSelectionIsDefault}
        >
          Reset columns
        </Button>
      </Group>
      <ParallelCoordinatesChart
        data={pcData}
        defaultHeight={400}
        maxHeight={1000}
        cfg={{
          lineOpacity,
          showGhostLines: showGhostLines
        }}
      />
      <Drawer
        opened={settingsOpened}
        onClose={close}
        title={'Settings'}
        padding={'md'}
        size={400}
      >
        <Title order={2}>Parallel coordinates</Title>

        <Stack gap={'xs'}>
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
          <ColumnSelection columns={columns} primaryColumns={defaultColumns} />
        </Stack>
      </Drawer>
    </>
  );
}
