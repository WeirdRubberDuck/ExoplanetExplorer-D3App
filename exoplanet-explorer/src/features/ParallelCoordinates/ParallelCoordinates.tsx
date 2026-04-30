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

import { useAppSelector } from '@/redux/hooks.ts';
import type { DataItem } from '@/types/types.ts';

import { ParallelCoordinatesChart } from './Chart.tsx';
import { ColumnSelection } from './ColumnSelection.tsx';
import { isSameColumnArray } from './util.ts';

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
  // TODO: Move this to local redux state, so we can move it out of this component
  const [lineOpacity, setLineOpacity] = useState(0.7);
  const [showGhostLines, setGhostLines] = useState(true);

  const [selectedColumns, setSelectedColumns] = useState<string[]>(pcDefaultColumns);

  const { full: data, columns, uncertainty } = useAppSelector((state) => state.data);

  const [settingsOpened, { open, close }] = useDisclosure(false);

  const columnSelectionIsDefault = useMemo(
    () => isSameColumnArray(selectedColumns, pcDefaultColumns),
    [selectedColumns]
  );

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
          onClick={() => setSelectedColumns(pcDefaultColumns)}
          disabled={columnSelectionIsDefault}
        >
          Reset columns
        </Button>
      </Group>
      <ParallelCoordinatesChart
        data={pcData}
        columns={selectedColumns}
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
          <ColumnSelection
            columns={columns}
            primaryColumns={pcDefaultColumns}
            defaultSelection={pcDefaultColumns}
            onSelectionChange={setSelectedColumns}
          />
        </Stack>
      </Drawer>
    </>
  );
}
