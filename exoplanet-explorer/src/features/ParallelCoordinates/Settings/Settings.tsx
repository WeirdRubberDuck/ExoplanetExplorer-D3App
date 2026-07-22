import { IoMdSettings } from 'react-icons/io';
import {
  ActionIcon,
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
import { setParallelCoordinatesSettings } from '@/redux/local/localSlice.ts';

import { ColumnSelection } from './ColumnSelection';

export function SettingsParallelCoordinates() {
  // Parallel coordinates settings from the Redux store
  const { defaultColumns, settings } = useAppSelector(
    (state) => state.local.parallelCoordinates
  );

  const [settingsOpened, { open, close }] = useDisclosure(false);

  const dispatch = useAppDispatch();

  return (
    <>
      <ActionIcon
        variant={'default'}
        size={'lg'}
        onClick={open}
        aria-label={'Open parallel coordinates settings'}
      >
        <IoMdSettings />
      </ActionIcon>

      <Drawer
        opened={settingsOpened}
        onClose={close}
        title={'Parallel Coordinates Settings'}
        padding={'md'}
        size={400}
      >
        <Stack gap={'xs'}>
          <ColumnSelection primaryColumns={defaultColumns} />

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
