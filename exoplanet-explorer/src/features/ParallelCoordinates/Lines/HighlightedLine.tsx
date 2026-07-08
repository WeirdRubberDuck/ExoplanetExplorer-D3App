import { useMemo } from 'react';

import { useAppSelector } from '@/redux/hooks.ts';
import type { DataItem } from '@/types/types.ts';

import { CanvasLines, type CanvasLinesProps } from './CanvasLines.tsx';

type Props = Omit<CanvasLinesProps, 'data'> & {
  sourceData: DataItem[];
};

function formatAxisValue(value: DataItem[string]): string {
  if (value == null || value === '') {
    return 'NA';
  }

  if (typeof value === 'number') {
    if (Math.abs(value) >= 10000 || Math.abs(value) < 0.01) {
      return value.toExponential(2);
    }

    return Number(value.toFixed(2)).toString();
  }

  return String(value);
}

export function HighlightedLine({ sourceData, ...props }: Props) {
  const itemId = useAppSelector((state) => state.local.hoveredId);
  const showText = useAppSelector(
    (state) => state.local.parallelCoordinates.settings.showTextOnHighlightedLine
  );

  const itemData = useMemo(
    () => sourceData.find((row) => row.id === itemId),
    [sourceData, itemId]
  );

  if (itemId === undefined || itemData === undefined) {
    return null;
  }

  const strokeWidth = 2.0 * (props.strokeWidth ?? 1.0);
  const xOffset = props.xOffset ?? 0;
  const yOffset = props.yOffset ?? 0;

  return (
    <>
      <CanvasLines
        {...props}
        data={[itemData]}
        strokeColor={'lime'}
        strokeWidth={strokeWidth}
      />
      {/* Add text per axis value */}
      {showText && (
        <svg
          width={props.width}
          height={props.height}
          style={{
            position: 'absolute',
            left: xOffset,
            top: yOffset,
            pointerEvents: 'none',
            overflow: 'visible'
          }}
        >
          {props.dimensions.map((dim) => {
            const x = props.xScale(dim.key);
            if (x == null) {
              return null;
            }

            const y = props.yPos(itemData, dim);
            const value = formatAxisValue(itemData[dim.key]);

            return (
              <text
                key={`highlight-value-${dim.key}`}
                x={x + 4}
                y={y - 4}
                fontSize={10}
                fill={'lime'}
                stroke={'rgba(0, 0, 0, 0.65)'}
                strokeWidth={2}
                paintOrder={'stroke'}
              >
                {value}
              </text>
            );
          })}
        </svg>
      )}
    </>
  );
}
