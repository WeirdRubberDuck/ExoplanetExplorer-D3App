import { useState } from 'react';
import * as d3 from 'd3';

interface Props {
  defaultChecked: boolean;
  y: number;
  size: number;
  strokeWidth?: number;
  onClick?: (value: boolean) => void;
}

export function UncertaintyAxisCheckbox({
  defaultChecked,
  y,
  size: size,
  strokeWidth,
  onClick
}: Props) {
  const [checked, setChecked] = useState(defaultChecked);

  const halfSize = size / 2;
  const checkmark = d3.line()([
    [0.2 * size, 0.5 * size],
    [0.4 * size, 0.69 * size],
    [0.8 * size, 0.2 * size]
  ]);

  function handleClick() {
    setChecked(!checked);
    if (onClick) {
      onClick(!checked);
    }
  }

  return (
    <g transform={`translate(${-halfSize}, ${y - halfSize})`} onClick={handleClick}>
      <rect ry={2} rx={2} width={size} height={size} stroke={'darkgray'} fill={'white'} />
      <path
        d={checkmark || undefined}
        stroke={checked ? 'var(--mantine-primary-color-filled)' : 'none'}
        strokeWidth={strokeWidth}
        fill={'none'}
      />
    </g>
  );
}
