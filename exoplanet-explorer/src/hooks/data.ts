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
  const crossFiltering = useAppSelector((state) => state.local.crossFiltering);
  const parallelCoordinatesFilteredIds = useAppSelector(
    (state) => state.local.parallelCoordinates.filteredIds
  );
  const cornerPlotFilteredIds = useAppSelector(
    (state) => state.local.cornerPlot.filteredIds
  );

  const filteredIds = useMemo(() => {
    const includeParallel = crossFiltering.parallelAffectsCorner;
    const includeCorner = crossFiltering.cornerAffectsParallel;

    const effectiveParallel = includeParallel
      ? parallelCoordinatesFilteredIds
      : undefined;
    const effectiveCorner = includeCorner ? cornerPlotFilteredIds : undefined;

    if (effectiveParallel === undefined && effectiveCorner === undefined) {
      return undefined;
    }

    if (effectiveParallel === undefined) {
      return effectiveCorner;
    }

    if (effectiveCorner === undefined) {
      return effectiveParallel;
    }

    const cornerIdSet = new Set(effectiveCorner);
    return effectiveParallel.filter((id) => cornerIdSet.has(id));
  }, [cornerPlotFilteredIds, crossFiltering, parallelCoordinatesFilteredIds]);

  const count = filteredIds ? filteredIds.length : undefined;
  return { filteredIds, count };
}
