import type { Uncertainty } from '@/types/types';
import { HIGHLIGHT_COLOR } from '@/utils/constants';

import { clampToCell, type CornerPoint } from '../helpers';
import type { NumericScale } from '../util';

const ERROR_BAR_CAP = 4;

// Pixel extent [lowEnd, highEnd] of value ± uncertainty, plus whether each end was clipped
function getErrorBarExtent(
  value: number,
  uncertainty: Uncertainty | undefined,
  scaleMeta: NumericScale,
  cellSize: number
) {
  if (!uncertainty || uncertainty.lower == null || uncertainty.upper == null) {
    return undefined;
  }

  let low = value - Math.abs(uncertainty.lower);
  const high = value + Math.abs(uncertainty.upper);
  if (scaleMeta.isLogScale && low <= 0) {
    [low] = scaleMeta.scale.domain();
  }

  const rawLow = scaleMeta.scale(low);
  const rawHigh = scaleMeta.scale(high);
  const pLow = clampToCell(rawLow, cellSize);
  const pHigh = clampToCell(rawHigh, cellSize);
  return { pLow, pHigh, lowClipped: pLow !== rawLow, highClipped: pHigh !== rawHigh };
}

interface Props {
  point: CornerPoint;
  xUncertainty: Uncertainty | undefined;
  yUncertainty: Uncertainty | undefined;
  xScaleMeta: NumericScale;
  yScaleMeta: NumericScale;
  cellSize: number;
}

export function ErrorBars({
  point,
  xUncertainty,
  yUncertainty,
  xScaleMeta,
  yScaleMeta,
  cellSize
}: Props) {
  const xBar = getErrorBarExtent(point.xValue, xUncertainty, xScaleMeta, cellSize);
  const yBar = getErrorBarExtent(point.yValue, yUncertainty, yScaleMeta, cellSize);

  return (
    <g stroke={HIGHLIGHT_COLOR} strokeWidth={1.5} pointerEvents={'none'}>
      {xBar && (
        <>
          <line x1={xBar.pLow} x2={xBar.pHigh} y1={point.y} y2={point.y} />
          {!xBar.lowClipped && (
            <line
              x1={xBar.pLow}
              x2={xBar.pLow}
              y1={point.y - ERROR_BAR_CAP}
              y2={point.y + ERROR_BAR_CAP}
            />
          )}
          {!xBar.highClipped && (
            <line
              x1={xBar.pHigh}
              x2={xBar.pHigh}
              y1={point.y - ERROR_BAR_CAP}
              y2={point.y + ERROR_BAR_CAP}
            />
          )}
        </>
      )}
      {yBar && (
        <>
          <line x1={point.x} x2={point.x} y1={yBar.pLow} y2={yBar.pHigh} />
          {!yBar.lowClipped && (
            <line
              x1={point.x - ERROR_BAR_CAP}
              x2={point.x + ERROR_BAR_CAP}
              y1={yBar.pLow}
              y2={yBar.pLow}
            />
          )}
          {!yBar.highClipped && (
            <line
              x1={point.x - ERROR_BAR_CAP}
              x2={point.x + ERROR_BAR_CAP}
              y1={yBar.pHigh}
              y2={yBar.pHigh}
            />
          )}
        </>
      )}
    </g>
  );
}
