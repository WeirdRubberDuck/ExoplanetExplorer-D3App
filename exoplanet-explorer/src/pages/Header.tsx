import { MdUpload } from 'react-icons/md';
import { Button, Divider, Flex, Group, Switch, Text, Tooltip } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { ConnectionStatusHint } from '@/components/ConnectionStatusHint';
import { DataFileInput } from '@/components/DataFileInput';
import { Settings } from '@/features/Settings/Settings';
import { useFilteredIds } from '@/hooks/data';
import { ConnectionStatus } from '@/redux/connection/connectionSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAutoSyncOpenSpaceSelection } from '@/redux/local/localSlice';
import { IconSize } from '@/types/enums';

import '@mantine/core/styles.css';

export function Header() {
  const filteringFromOpenSpace = useAppSelector(
    (state) => state.data.filteredPlanetsFromOpenSpace
  );

  const autoSyncOpenSpaceSelection = useAppSelector(
    (state) => state.local.autoSyncOpenSpaceSelection
  );

  const isConnected = useAppSelector(
    (state) => state.connection.connectionStatus === ConnectionStatus.Connected
  );

  const { filteredIds, count } = useFilteredIds();

  const luaApi = useOpenSpaceApi();

  const dispatch = useAppDispatch();

  return (
    <Flex justify={'space-between'} align={'center'} h={'100%'}>
      <Group flex={1} wrap={'nowrap'}>
        <Text fw={'bold'}>ExoplanetExplorer</Text>
        <Divider orientation={'vertical'} />
        <ConnectionStatusHint />
        <Group gap={'xs'}>
          <Tooltip
            label={
              'Automatically sync filtering from OpenSpace so this page correctly reflects the current OpenSpace filter'
            }
            w={300}
          >
            <Switch
              label={'Auto-sync OpenSpace filter'}
              checked={autoSyncOpenSpaceSelection}
              onChange={(event) =>
                dispatch(setAutoSyncOpenSpaceSelection(event.currentTarget.checked))
              }
              disabled={!isConnected}
            />
          </Tooltip>
          <Text size={'xs'} c={'dimmed'}>
            {`(${filteringFromOpenSpace?.length ?? 0} planets)`}
          </Text>
        </Group>
        <Divider orientation={'vertical'} />
        <Group gap={'xs'}>
          <Tooltip label={'Send the currently filtered planets to OpenSpace'}>
            <Button
              leftSection={<MdUpload size={IconSize.md} />}
              size={'sm'}
              onClick={() => {
                luaApi?.setPropertyValueSingle(
                  'Modules.ExoplanetsExpertTool.ExoplanetsToolGui.DataViewer.ExternalSelection',
                  filteredIds ?? []
                );
              }}
              disabled={!isConnected}
            >
              Send to OpenSpace
            </Button>
          </Tooltip>
          <Text size={'xs'} c={'dimmed'}>
            {`(${count !== undefined ? count : 'All'} planets)`}
          </Text>
        </Group>
      </Group>
      <Group gap={'xs'}>
        <DataFileInput />
        <Settings />
        <ColorSchemeToggle />
      </Group>
    </Flex>
  );
}
