// Use either the full dataset in redux, or a filtered dataset from OpenSpace,

import { useMemo } from 'react';

import { useAppSelector } from '@/redux/hooks';

// depending on the autoSyncOpenSpaceSelection setting in redux
export function useBaseDataset() {
  const autoSyncOpenSpaceSelection = useAppSelector(
    (state) => state.local.autoSyncOpenSpaceSelection
  );

  const fullDataset = useAppSelector((state) => state.data.full);
  const filteredIds = useAppSelector((state) => state.data.filteredPlanetsFromOpenSpace);

  const filteredDataset = useMemo(() => {
    if (!filteredIds || filteredIds.length === 0) {
      return [];
    }
    return fullDataset.filter((planet) => filteredIds.includes(planet.id));
  }, [fullDataset, filteredIds]);

  if (!autoSyncOpenSpaceSelection) {
    return fullDataset;
  }

  return filteredDataset;
}

export function useFilteredIds() {
  // TODO: Should combine multiple selections, but for now just use the PC filtered IDs
  const filteredIds = useAppSelector(
    (state) => state.local.parallelCoordinates.filteredIds
  );
  const count = filteredIds ? filteredIds.length : undefined;
  return { filteredIds, count };
}
