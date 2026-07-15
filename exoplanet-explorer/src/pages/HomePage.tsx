import { useEffect } from 'react';
import { Box, Group } from '@mantine/core';

import { ParallelCoordinates } from '@/features/ParallelCoordinates/ParallelCoordinates';
import { SelectionList } from '@/features/SelectionList/SelectionList';
import { SettingsBar } from '@/features/SettingsBar/SettingsBar';
import { initializeData } from '@/redux/data/dataSlice';
import { useAppDispatch } from '@/redux/hooks';

// TODO: Load real data from a server or local file
const dataUrl = new URL('../data/aggregated_data.json', import.meta.url).href;

export function HomePage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(dataUrl);
      const json = await response.json();
      dispatch(initializeData(json));
    };

    void loadData();
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
