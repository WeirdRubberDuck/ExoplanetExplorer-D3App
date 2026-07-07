import { useEffect } from 'react';
import { Box, Group, Text } from '@mantine/core';

import { ParallelCoordinates } from '@/features/ParallelCoordinates/ParallelCoordinates';
import { SelectionList } from '@/features/SelectionList/SelectionList';
import { SettingsBar } from '@/features/SettingsBar/SettingsBar';
import { data } from '@/public/dummydata'; // TODO: Replace with actual data
import { initializeData } from '@/redux/data/dataSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export function HomePage() {
  const filteringFromOpenSpace = useAppSelector(
    (state) => state.data.filteredPlanetsFromOpenSpace
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeData(data));
  }, [dispatch]);

  return (
    <>
      <Text size={'xs'} c={'dimmed'}>
        {` (Detected filtering in OpenSpace resulting in ${filteringFromOpenSpace?.length ?? 0} planets)`}
      </Text>

      <SettingsBar />

      <Group align={'flex-start'} wrap={'nowrap'}>
        <Box w={900}>
          <ParallelCoordinates />
        </Box>
        <Box w={300}>
          <SelectionList />
        </Box>
      </Group>
    </>
  );
}
