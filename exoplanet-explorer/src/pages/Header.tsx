import { MdUpload } from 'react-icons/md';
import { Button, Checkbox, Divider, Flex, Group, Text, Tooltip } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { ConnectionStatusHint } from '@/components/ConnectionStatusHint';
import { DataFileInput } from '@/components/DataFileInput';
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
        <Text>Exoplanet Explorer</Text>
        <ConnectionStatusHint />
        <Checkbox
          label={'Auto-sync filtered planets from OpenSpace'}
          checked={autoSyncOpenSpaceSelection}
          onChange={(event) => {
            dispatch(setAutoSyncOpenSpaceSelection(event.currentTarget.checked));
          }}
          disabled={!isConnected}
        />
        <Text size={'xs'} c={'dimmed'}>
          {`(${filteringFromOpenSpace?.length ?? 0} planets)`}
        </Text>
        <Divider orientation={'vertical'} />
        <Tooltip label={'Send the currently filtered planets to OpenSpace'}>
          <Button
            leftSection={<MdUpload size={IconSize.md} />}
            onClick={() => {
              luaApi.setPropertyValueSingle(
                'Modules.ExoplanetsExpertTool.ExoplanetsToolGui.DataViewer.ExternalSelection',
                filteredIds
              );
            }}
            disabled={
              filteredIds === undefined || filteredIds.length === 0 || !isConnected
            }
          >
            Send to OpenSpace
          </Button>
        </Tooltip>
        <Text size={'xs'} c={'dimmed'}>
          {`(${count !== undefined ? count : 'All'} planets)`}
        </Text>
      </Group>
      <Group>
        <DataFileInput />
        <ColorSchemeToggle />
      </Group>
    </Flex>
  );
}
