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
import {
  resetParallelCoordinates,
  setParallelCoordinatesLineOpacity,
  setParallelCoordinatesShowGhostLines
} from '@/redux/local/localSlice.ts';

import { ColumnSelection } from './paralellcoordinates/ColumnSelection';

export function SettingsBar() {
  const { columns } = useAppSelector((state) => state.data);

  // Paralell coordinates settings from the Redux store
  const { columnSelectionIsDefault, defaultColumns, settings } = useAppSelector(
    (state) => state.local.parallelCoordinates
  );

  const [settingsOpened, { open, close }] = useDisclosure(false);

  const dispatch = useAppDispatch();

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
              value={settings.lineOpacity}
              onChange={(value) => dispatch(setParallelCoordinatesLineOpacity(value))}
              min={0}
              max={1}
              step={0.01}
            />
          </Box>
          <Checkbox
            label={'Show ghost lines for filtered out paths'}
            checked={settings.showGhostLines}
            onChange={(e) =>
              dispatch(setParallelCoordinatesShowGhostLines(e.target.checked))
            }
          />
          <ColumnSelection columns={columns} primaryColumns={defaultColumns} />
        </Stack>
      </Drawer>
    </>
  );
}
