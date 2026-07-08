import { useState } from 'react';
import { Text } from '@mantine/core';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setHoveredItemId } from '@/redux/local/localSlice';

export function PlanetListItem({ id }: { id: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();

  const data = useAppSelector((state) => state.data.full[id]);
  const objectNameColumn = useAppSelector((state) => state.local.objectNameColumn);

  function setIdOnHover(id: number | undefined) {
    setIsHovered(id !== undefined);
    dispatch(setHoveredItemId(id));
  }

  return (
    <Text
      key={id}
      size={'sm'}
      px={'xs'}
      py={2}
      bg={isHovered ? 'var(--mantine-primary-color-filled)' : undefined}
      onMouseEnter={() => setIdOnHover(id)}
      onMouseLeave={() => setIdOnHover(undefined)}
    >
      {data?.[objectNameColumn]}
    </Text>
  );
}
