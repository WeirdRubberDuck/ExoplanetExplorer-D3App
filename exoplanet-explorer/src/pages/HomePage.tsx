import { useEffect } from 'react';
import { Box, Group } from '@mantine/core';

import { ParallelCoordinates } from '@/features/ParallelCoordinates/ParallelCoordinates';
import { SelectionList } from '@/features/SelectionList/SelectionList';
import { SettingsBar } from '@/features/SettingsBar/SettingsBar';
import { data } from '@/public/dummydata'; // TODO: Replace with actual data
import { initializeData } from '@/redux/data/dataSlice';
import { useAppDispatch } from '@/redux/hooks';

export function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeData(data));
  }, [dispatch]);

  return (
    <>
      <SettingsBar />

      <Group align={'flex-start'} wrap={'nowrap'}>
        <Box>
          <ParallelCoordinates />
        </Box>
        <Box w={300}>
          <SelectionList />
        </Box>
      </Group>
    </>
  );
}
