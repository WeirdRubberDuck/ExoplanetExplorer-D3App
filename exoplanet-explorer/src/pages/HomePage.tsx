import { useEffect, useState } from 'react';
import { Stack, Text } from '@mantine/core';

import { useOpenSpaceApi } from '@/api/hooks';
import { ParallelCoordinates } from '@/features/ParallelCoordinates/ParallelCoordinates';

export function HomePage() {
  const [nNumPlanets, setNumPlanets] = useState<number | null>(null);
  const luaApi = useOpenSpaceApi();

  useEffect(() => {
    if (!luaApi) {
      return;
    }

    // TODO: Set up a subscription to this property instead of polling it once.
    // Actually, move to redux? Could keep polling the property and update the store when it changes
    luaApi
      .propertyValue('Modules.ExoplanetsExpertTool.FilteredDataRows')
      .then((res) => {
        console.log('Got property value:', res);
        if (!res) {
          console.warn('Property value is null or undefined');
          setNumPlanets(null);
          return;
        }

        console.log('Type of res:', Object.values(res));
        const numPlanets = Object.values(res).length;
        setNumPlanets(numPlanets);
      })
      .catch((e) => {
        console.error('Failed to get property value:', e);
      });
  }, [luaApi]);

  return (
    <Stack gap={'xs'}>
      <Text size={'xs'} c={'dimmed'}>
        {nNumPlanets !== null
          ? ` (Detected filtering in OpenSpace resulting in ${nNumPlanets} planets)`
          : ''}
      </Text>
      <ParallelCoordinates />
    </Stack>
  );
}
