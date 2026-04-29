import * as d3 from 'd3';

interface Props {
  width: number;
  lineY: number;
  missingValueLabelY?: number;
  uncertaintyLabelY?: number;
  showUncertaintyLabel?: boolean;
}

export function MissingValueAxisLabel({
  width,
  lineY,
  missingValueLabelY = lineY - 10,
  uncertaintyLabelY = lineY + 17,
  showUncertaintyLabel = true
}: Props) {
  const textPositionX = -20;
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
          y={missingValueLabelY}
          fontSize={'11px'}
          fill={'var(--mantine-color-default-color)'}
          textAnchor={'end'}
          dominantBaseline={'middle'}
        >
          Missing values
        </text>
        {showUncertaintyLabel && (
          <text
            x={textPositionX}
            y={uncertaintyLabelY}
            fontSize={'11px'}
            fill={'var(--mantine-color-default-color)'}
            textAnchor={'end'}
            dominantBaseline={'middle'}
          >
            Uncertainty axis
          </text>
        )}
      </g>
    </>
  );
}
