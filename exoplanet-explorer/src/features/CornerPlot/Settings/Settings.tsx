import { IoMdSettings } from 'react-icons/io';
import {
  ActionIcon,
  Checkbox,
  Drawer,
  Group,
  Radio,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setCornerPlotSettings,
  setCrossFilteringSettings
} from '@/redux/local/localSlice';

import { CornerPlotColumnSelection } from './ColumnSelection';

export function CornerPlotSettings() {
  const [settingsOpened, { open, close }] = useDisclosure(false);

  const { defaultColumns, settings } = useAppSelector((state) => state.local.cornerPlot);
  const crossFiltering = useAppSelector((state) => state.local.crossFiltering);
  const dispatch = useAppDispatch();

  return (
    <>
      <ActionIcon
        variant={'default'}
        onClick={open}
        aria-label={'Open corner plot settings'}
      >
        <IoMdSettings />
      </ActionIcon>

      <Drawer
        opened={settingsOpened}
        onClose={close}
        title={'Corner Plot Settings'}
        padding={'md'}
        size={420}
      >
        <Stack gap={'xs'}>
          <CornerPlotColumnSelection primaryColumns={defaultColumns} />

          <Title order={3} size={'md'}>
            Rendering
          </Title>

          <Radio.Group
            label={'Point rendering mode'}
            value={settings.renderMode}
            onChange={(value) =>
              dispatch(
                setCornerPlotSettings({
                  renderMode: value as 'scatter' | 'density'
                })
              )
            }
          >
            <Group mt={4}>
              <Radio value={'scatter'} label={'Scatter'} />
              <Radio value={'density'} label={'Density bins'} />
            </Group>
          </Radio.Group>

          <Checkbox
            label={'Invert layout (show scatter matrix in upper-right triangle)'}
            checked={settings.invertLayout}
            onChange={(event) =>
              dispatch(
                setCornerPlotSettings({
                  invertLayout: event.currentTarget.checked
                })
              )
            }
          />

          <Text size={'xs'} c={'dimmed'}>
            The corner plot matrix grows quadratically with selected columns, so 4-8
            columns usually gives the clearest scientific view.
          </Text>

          <Title order={3} size={'md'}>
            Cross-filtering
          </Title>
          <Checkbox
            label={'Apply parallel coordinates filtering in corner plot'}
            checked={crossFiltering.parallelAffectsCorner}
            onChange={(event) =>
              dispatch(
                setCrossFilteringSettings({
                  parallelAffectsCorner: event.currentTarget.checked
                })
              )
            }
          />
          <Checkbox
            label={'Apply corner plot filtering in parallel coordinates'}
            checked={crossFiltering.cornerAffectsParallel}
            onChange={(event) =>
              dispatch(
                setCrossFilteringSettings({
                  cornerAffectsParallel: event.currentTarget.checked
                })
              )
            }
          />
        </Stack>
      </Drawer>
    </>
  );
}
