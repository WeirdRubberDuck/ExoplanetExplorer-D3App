import { Box, Checkbox, Group, Text } from '@mantine/core';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { ConnectionStatusHint } from '@/components/ConnectionStatusHint';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAutoSyncOpenSpaceSelection } from '@/redux/local/localSlice';

export function StandaloneChartHeader() {
  const dispatch = useAppDispatch();
  const autoSync = useAppSelector((state) => state.local.autoSyncOpenSpaceSelection);
  const filteredIds = useAppSelector((state) => state.data.filteredPlanetsFromOpenSpace);

  return (
    <Box
      component={'header'}
      p={'sm'}
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        flexShrink: 0
      }}
    >
      <Group justify={'space-between'} gap={'sm'}>
        <ConnectionStatusHint />
        <Group gap={'sm'}>
          {autoSync && (
            <Text size={'xs'} c={'dimmed'} mt={4} role={'status'}>
              {filteredIds === undefined
                ? 'Waiting for OpenSpace filtering'
                : `${filteredIds.length} planets in OpenSpace selection`}
            </Text>
          )}
          <Checkbox
            label={'Sync filtering from OpenSpace'}
            checked={autoSync}
            onChange={(event) =>
              dispatch(setAutoSyncOpenSpaceSelection(event.currentTarget.checked))
            }
          />
          <ColorSchemeToggle />
        </Group>
      </Group>
    </Box>
  );
}
