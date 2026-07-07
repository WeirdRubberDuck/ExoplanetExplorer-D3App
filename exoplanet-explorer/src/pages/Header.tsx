import { Checkbox, Flex, Group, Text } from '@mantine/core';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { ConnectionStatusHint } from '@/components/ConnectionStatusHint';
import { DataFileInput } from '@/components/DataFileInput';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAutoSyncOpenSpaceSelection } from '@/redux/local/localSlice';

import '@mantine/core/styles.css';

export function Header() {
  const filteringFromOpenSpace = useAppSelector(
    (state) => state.data.filteredPlanetsFromOpenSpace
  );

  const autoSyncOpenSpaceSelection = useAppSelector(
    (state) => state.local.autoSyncOpenSpaceSelection
  );

  const dispatch = useAppDispatch();

  return (
    <Flex justify={'space-between'} align={'center'} h={'100%'}>
      <Group flex={1}>
        <Text>Exoplanet Explorer</Text>
        <ConnectionStatusHint />
        <Checkbox
          label={'Auto-sync filtered planets from OpenSpace'}
          checked={autoSyncOpenSpaceSelection}
          onChange={(event) => {
            dispatch(setAutoSyncOpenSpaceSelection(event.currentTarget.checked));
          }}
        />
        <Text size={'xs'} c={'dimmed'}>
          {` (${filteringFromOpenSpace?.length ?? 0} planets)`}
        </Text>
      </Group>
      <Group>
        <DataFileInput />
        <ColorSchemeToggle />
      </Group>
    </Flex>
  );
}
