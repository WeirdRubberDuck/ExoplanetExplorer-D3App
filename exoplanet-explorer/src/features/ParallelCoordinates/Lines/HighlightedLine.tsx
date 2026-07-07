import { useAppSelector } from '@/redux/hooks.ts';

import { CanvasLines, type CanvasLinesProps } from './CanvasLines.tsx';

type Props = Omit<CanvasLinesProps, 'data'>;

export function HighlightedLine(props: Props) {
  const itemId = useAppSelector((state) => state.local.hoveredId);
  const itemData = useAppSelector((state) =>
    itemId !== undefined ? state.data.full[itemId] : undefined
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
