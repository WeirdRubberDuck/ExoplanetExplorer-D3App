import * as d3 from 'd3';

import type { Column } from '@/types/types.ts';

import { type Dimension, NanBrushMode } from '../types.ts';

import { Axis } from './Axis.tsx';
import { MissingValueAxis } from './MissingValueAxis.tsx';
import { MissingValueAxisLabel } from './MissinValueAxisLabel.tsx';
import { UncertaintyAxisCheckbox } from './UncertaintyAxisCheckbox.tsx';

interface Props {
  dimensions: Dimension[];
  columnsWithUncertainty: Column[];
  enabledUncertaintyColumns: Column[];
  xScale: d3.ScalePoint<string>;
  nanAxisYPos: number;
  handleBrush: (dimension: Dimension, y0: number, y1: number) => void;
  handleBrushClear: (dimension: Dimension) => void;
  handleNanBrush: (dimension: Dimension, mode: NanBrushMode | undefined) => void;
  onUncertaintyToggle: (dimensionKey: string, enabled: boolean) => void;
}

export function Axes({
  dimensions,
  columnsWithUncertainty,
  enabledUncertaintyColumns,
  xScale,
  nanAxisYPos,
  handleBrush,
  handleBrushClear,
  handleNanBrush,
  onUncertaintyToggle
}: Props) {
  const internalWidth = xScale.range()[1] - xScale.range()[0];
  const missingValueY = nanAxisYPos;
  const axisLabelY = nanAxisYPos + 15;
  const uncertaintyCheckboxY = nanAxisYPos + 32;
  return (
    <>
      {dimensions.map((dim) => (
        <g key={dim.key} transform={`translate(${xScale(dim.key)},0)`}>
          <Axis
            dimension={dim}
            handleBrush={handleBrush}
            handleBrushClear={handleBrushClear}
          />
          <MissingValueAxis dimension={dim} y={missingValueY} onBrush={handleNanBrush} />
          {columnsWithUncertainty.includes(dim.key) && (
            <UncertaintyAxisCheckbox
              defaultChecked={enabledUncertaintyColumns.includes(dim.key)}
              y={uncertaintyCheckboxY}
              size={14}
              strokeWidth={3}
              onClick={(checked) => onUncertaintyToggle(dim.key, checked)}
            />
          )}
        </g>
      ))}
      {/* NaN axis line and label */}
      <MissingValueAxisLabel
        lineY={axisLabelY}
        missingValueLabelY={missingValueY}
        uncertaintyLabelY={uncertaintyCheckboxY}
        width={internalWidth}
      />
    </>
  );
}
