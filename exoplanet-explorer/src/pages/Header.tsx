import { Flex, Group, Text } from '@mantine/core';

import { ColorSchemeToggle } from '@/components/ColorSchemeToggle';
import { ConnectionStatusHint } from '@/components/ConnectionStatusHint';
import { DataFileInput } from '@/components/DataFileInput';

import '@mantine/core/styles.css';

export function Header() {
  return (
    <Flex justify={'space-between'} align={'center'} h={'100%'}>
      <Group flex={1}>
        <Text>Exoplanet Explorer</Text>
        <ConnectionStatusHint />
      </Group>
      <Group>
        <DataFileInput />
        <ColorSchemeToggle />
      </Group>
    </Flex>
  );
}
