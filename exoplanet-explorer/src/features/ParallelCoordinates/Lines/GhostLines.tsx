import { useMemo } from 'react';
import { useMantineColorScheme } from '@mantine/core';

import { CanvasLines, type CanvasLinesProps } from './CanvasLines.tsx';

interface Props extends CanvasLinesProps {
  strokeColor?: never;
}

export function GhostLines(props: Props) {
  const { colorScheme } = useMantineColorScheme();

  const ghostLineColor = useMemo(() => {
    const colorVariable =
      colorScheme === 'dark' ? '--mantine-color-dark-5' : '--mantine-color-gray-2';

    const resolvedColor = getComputedStyle(document.documentElement)
      .getPropertyValue(colorVariable)
      .trim();

    return resolvedColor;
  }, [colorScheme]);

  return <CanvasLines {...props} strokeColor={ghostLineColor} />;
}
