import { useState } from 'react';

import { type Dimension, NanBrushMode } from '../types';

interface Props {
  dimension: Dimension;
  y: number;
  onBrush?: (dimension: Dimension, mode: NanBrushMode | undefined) => void;
}

export function MissingValueAxis({ dimension, y, onBrush }: Props) {
  const [brushMode, setBrushMode] = useState<NanBrushMode | undefined>(undefined);
  const [hovered, setHovered] = useState(false);

  function colorForMode(mode: NanBrushMode | undefined) {
    if (mode === NanBrushMode.Block) return 'rgba(220, 0, 0)';
    if (mode === NanBrushMode.Filter) return 'rgba(0, 220, 0)';
    return 'darkgray';
  }

  function onClick() {
    let newMode: NanBrushMode | undefined;
    if (brushMode === NanBrushMode.Block) {
      newMode = NanBrushMode.Filter;
    } else if (brushMode === NanBrushMode.Filter) {
      newMode = undefined;
    } else {
      newMode = NanBrushMode.Block;
    }
    setBrushMode(newMode);
    onBrush?.(dimension, newMode);
  }

  return (
    <circle
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      cx={0}
      cy={y}
      r={hovered ? 7 : 5}
      fill={colorForMode(brushMode)}
      onClick={onClick}
    />
  );
}
