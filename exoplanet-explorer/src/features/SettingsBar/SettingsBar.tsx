import { IoMdSettings } from 'react-icons/io';
import {
  Button,
  Checkbox,
  Drawer,
  Group,
  Select,
  Slider,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useAppDispatch, useAppSelector } from '@/redux/hooks.ts';
import {
  resetParallelCoordinates,
  setObjectNameColumn,
  setParallelCoordinatesSettings
} from '@/redux/local/localSlice.ts';

import { ColumnSelection } from './paralellcoordinates/ColumnSelection';

export function SettingsBar() {
  const { columns } = useAppSelector((state) => state.data);

  // Paralell coordinates settings from the Redux store
  const { columnSelectionIsDefault, defaultColumns, settings } = useAppSelector(
    (state) => state.local.parallelCoordinates
  );

  const objectNameColumn = useAppSelector((state) => state.local.objectNameColumn);

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
        <Select
          label={'Object name column'}
          value={objectNameColumn}
          onChange={(value) => dispatch(setObjectNameColumn(value))}
          data={columns.map((col) => ({ value: col, label: col }))}
          searchable
        />
        <Title order={2} mb={'xs'}>
          Parallel coordinates
        </Title>

        <Stack gap={'xs'}>
          <ColumnSelection columns={columns} primaryColumns={defaultColumns} />

          <Title order={3} size={'md'}>
            Lines
          </Title>
          <Group w={'100%'}>
            <Text size={'sm'}>Line opacity</Text>
            <Slider
              value={settings.lineOpacity}
              onChange={(value) =>
                dispatch(setParallelCoordinatesSettings({ lineOpacity: value }))
              }
              min={0}
              max={1}
              step={0.01}
              flex={1}
            />
          </Group>
          <Checkbox
            label={'Show ghost lines for filtered out paths'}
            checked={settings.showGhostLines}
            onChange={(e) =>
              dispatch(
                setParallelCoordinatesSettings({
                  showGhostLines: e.target.checked
                })
              )
            }
          />
          <Checkbox
            label={'Show text on highlighted line'}
            checked={settings.showTextOnHighlightedLine}
            onChange={(e) =>
              dispatch(
                setParallelCoordinatesSettings({
                  showTextOnHighlightedLine: e.target.checked
                })
              )
            }
          />

          <Title order={3} size={'md'}>
            Axes
          </Title>
          <Checkbox
            label={'Show violin plots'}
            checked={settings.axisViolinPlots.show}
            onChange={(e) =>
              dispatch(
                setParallelCoordinatesSettings({
                  axisViolinPlots: {
                    ...settings.axisViolinPlots,
                    show: e.target.checked
                  }
                })
              )
            }
          />
          <Checkbox
            label={'Include missing values in violin plots'}
            checked={settings.axisViolinPlots.showMissingValueLobe}
            onChange={(e) =>
              dispatch(
                setParallelCoordinatesSettings({
                  axisViolinPlots: {
                    ...settings.axisViolinPlots,
                    showMissingValueLobe: e.target.checked
                  }
                })
              )
            }
            disabled={!settings.axisViolinPlots.show}
          />
        </Stack>
      </Drawer>
    </>
  );
}
