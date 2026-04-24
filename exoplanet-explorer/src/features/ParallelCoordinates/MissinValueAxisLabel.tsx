import * as d3 from 'd3';

interface Props {
  yPos: number;
  width: number;
  showUncertaintyLabel?: boolean;
}

export function MissingValueAxisLabel({
  yPos,
  width,
  showUncertaintyLabel = true
}: Props) {
  const textPositionX = -20;
  const lineY = yPos + 15;
  const xExtend = 30;

  const line = d3.line()([
    [0 - xExtend, lineY],
    [width + xExtend, lineY]
  ]);

  return (
    <>
      <path d={line || undefined} stroke={'darkgray'} strokeWidth={0.4} />
      <g>
        <text
          className={'legend'}
          x={textPositionX}
          y={lineY}
          dy={-10}
          fontSize={'11px'}
          fill={'var(--mantine-color-default-color)'}
          textAnchor={'end'}
        >
          Missing values
        </text>
        {showUncertaintyLabel && (
          <text
            x={textPositionX}
            y={lineY}
            dy={17}
            fontSize={'11px'}
            fill={'var(--mantine-color-default-color)'}
            textAnchor={'end'}
          >
            Uncertainty axis
          </text>
        )}
      </g>
    </>
  );
}
