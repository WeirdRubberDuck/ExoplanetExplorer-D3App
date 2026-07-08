import * as d3 from 'd3';

interface Props {
  checked: boolean;
  y: number;
  size: number;
  strokeWidth?: number;
  onChange?: (value: boolean) => void;
}

export function UncertaintyAxisCheckbox({
  checked,
  y,
  size: size,
  strokeWidth,
  onChange
}: Props) {
  const halfSize = size / 2;
  const checkmark = d3.line()([
    [0.2 * size, 0.5 * size],
    [0.4 * size, 0.69 * size],
    [0.8 * size, 0.2 * size]
  ]);

  function handleClick() {
    if (onChange) {
      onChange(!checked);
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
