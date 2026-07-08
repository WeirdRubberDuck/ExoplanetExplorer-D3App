import { useMemo } from 'react';

import { useAppSelector } from '@/redux/hooks.ts';
import type { DataItem } from '@/types/types.ts';

import { CanvasLines, type CanvasLinesProps } from './CanvasLines.tsx';

type Props = Omit<CanvasLinesProps, 'data'> & {
  sourceData: DataItem[];
};

export function HighlightedLine({ sourceData, ...props }: Props) {
  const itemId = useAppSelector((state) => state.local.hoveredId);
  const itemData = useMemo(
    () => sourceData.find((row) => row.id === itemId),
    [sourceData, itemId]
  );

  if (itemId === undefined || itemData === undefined) {
    return;
  }

  const strokeWidth = 2.0 * (props.strokeWidth ?? 1.0);

  return (
    <CanvasLines
      {...props}
      data={[itemData]}
      strokeColor={'lime'}
      strokeWidth={strokeWidth}
    />
  );
}
