import type { MouseEvent } from 'react';

import type { Column, UncertaintyDataItem } from '@/types/types';
import { HIGHLIGHT_COLOR } from '@/utils/constants';

import {
  type ActiveBrush,
  type BrushDraft,
  type CornerPoint,
  getCellKey,
  getTranslatedBrush,
  type MovingBrushDraft
} from '../helpers';
import type { NumericScale } from '../util';

import { DiagonalHistogram } from './DiagonalHistogram';
import { ErrorBars } from './ErrorBars';

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Props {
  chartWidth: number;
  chartHeight: number;
  margin: Margin;
  selectedNumericColumns: Column[];
  scales: Map<Column, NumericScale>;
  cellSize: number;
  cellPointsByKey: Map<string, CornerPoint[]>;
  hoveredId: number | undefined;
  hoveredUncertainty: UncertaintyDataItem | undefined;
  invertLayout: boolean;
  brushDraft: BrushDraft | undefined;
  activeBrushes: ActiveBrush[];
  movingBrushDraft: MovingBrushDraft | undefined;
  onBrushMove: (event: MouseEvent<SVGSVGElement>) => void;
  onBrushEnd: () => void;
  onBrushStart: (
    event: MouseEvent<SVGRectElement>,
    xColumn: Column,
    yColumn: Column,
    xOffset: number,
    yOffset: number
  ) => void;
  onBrushDragStart: (event: MouseEvent<SVGRectElement>, brushIndex: number) => void;
  onClearBrushesForCell: (xColumn: Column, yColumn: Column) => void;
}

export function SvgLayer({
  chartWidth,
  chartHeight,
  margin,
  selectedNumericColumns,
  scales,
  cellSize,
  cellPointsByKey,
  hoveredId,
  hoveredUncertainty,
  invertLayout,
  brushDraft,
  activeBrushes,
  movingBrushDraft,
  onBrushMove,
  onBrushEnd,
  onBrushStart,
  onBrushDragStart,
  onClearBrushesForCell
}: Props) {
  return (
    <svg
      width={chartWidth}
      height={chartHeight}
      style={{ position: 'absolute', inset: 0 }}
      onMouseMove={onBrushMove}
      onMouseUp={onBrushEnd}
      onMouseLeave={onBrushEnd}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {selectedNumericColumns.map((yColumn, rowIndex) => {
          const yScaleMeta = scales.get(yColumn);
          if (!yScaleMeta) {
            return null;
          }

          return selectedNumericColumns.map((xColumn, colIndex) => {
            const xScaleMeta = scales.get(xColumn);
            if (!xScaleMeta) {
              return null;
            }

            const xCellOffset = colIndex * cellSize;
            const yCellOffset = rowIndex * cellSize;
            const cellKey = getCellKey(xColumn, yColumn);
            const points = cellPointsByKey.get(cellKey) ?? [];
            const hoveredPoint = points.find((point) => point.id === hoveredId);
            const isScatterCell = invertLayout
              ? rowIndex < colIndex
              : rowIndex > colIndex;

            const isDiagonalCell = rowIndex === colIndex;

            return (
              <g
                key={`cell-${cellKey}`}
                transform={`translate(${xCellOffset}, ${yCellOffset})`}
              >
                <rect
                  width={cellSize}
                  height={cellSize}
                  fill={isDiagonalCell ? 'white' : 'transparent'}
                  stroke={'var(--mantine-color-gray-3)'}
                />

                {isDiagonalCell && (
                  <DiagonalHistogram
                    points={points}
                    xScaleMeta={xScaleMeta}
                    cellSize={cellSize}
                  />
                )}

                {isScatterCell && (
                  <rect
                    width={cellSize}
                    height={cellSize}
                    fill={'transparent'}
                    style={{ cursor: 'crosshair' }}
                    onMouseDown={(event) =>
                      onBrushStart(event, xColumn, yColumn, xCellOffset, yCellOffset)
                    }
                    onDoubleClick={() => onClearBrushesForCell(xColumn, yColumn)}
                  />
                )}

                {brushDraft && brushDraft.cellKey === cellKey && (
                  <rect
                    x={Math.min(brushDraft.x0, brushDraft.x1)}
                    y={Math.min(brushDraft.y0, brushDraft.y1)}
                    width={Math.abs(brushDraft.x1 - brushDraft.x0)}
                    height={Math.abs(brushDraft.y1 - brushDraft.y0)}
                    fill={'rgba(80, 120, 255, 0.18)'}
                    stroke={'rgba(60, 90, 220, 0.9)'}
                    strokeWidth={1}
                  />
                )}

                {activeBrushes.map((brush, brushIndex) => {
                  if (brush.cellKey !== cellKey) {
                    return null;
                  }

                  const displayBrush =
                    movingBrushDraft?.brushIndex === brushIndex
                      ? getTranslatedBrush(movingBrushDraft, cellSize)
                      : brush;

                  return (
                    <rect
                      key={`active-brush-${cellKey}-${brushIndex}`}
                      x={displayBrush.minX}
                      y={displayBrush.minY}
                      width={Math.max(0, displayBrush.maxX - displayBrush.minX)}
                      height={Math.max(0, displayBrush.maxY - displayBrush.minY)}
                      fill={'rgba(60, 140, 230, 0.18)'}
                      stroke={'rgba(20, 90, 190, 0.95)'}
                      strokeDasharray={'5 3'}
                      strokeWidth={2}
                      style={{ cursor: 'move' }}
                      onMouseDown={(event) => onBrushDragStart(event, brushIndex)}
                    />
                  );
                })}

                {isScatterCell && hoveredPoint && (
                  <ErrorBars
                    point={hoveredPoint}
                    xUncertainty={hoveredUncertainty?.[xColumn]}
                    yUncertainty={hoveredUncertainty?.[yColumn]}
                    xScaleMeta={xScaleMeta}
                    yScaleMeta={yScaleMeta}
                    cellSize={cellSize}
                  />
                )}

                {isScatterCell && hoveredPoint && (
                  <>
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r={4}
                      fill={HIGHLIGHT_COLOR}
                      stroke={'var(--mantine-color-dark-9)'}
                      strokeWidth={1.5}
                      pointerEvents={'none'}
                    />
                    <text
                      x={hoveredPoint.x + 8}
                      y={hoveredPoint.y + 10}
                      fontSize={9}
                      fontWeight={700}
                      fill={'var(--mantine-color-text)'}
                      style={{
                        filter: 'drop-shadow(0 0 5px var(--mantine-color-body))'
                      }}
                      textAnchor={'start'}
                      pointerEvents={'none'}
                    >
                      <tspan>{Number(hoveredPoint.xValue).toFixed(2)}</tspan>
                      <tspan>, {Number(hoveredPoint.yValue).toFixed(2)}</tspan>
                    </text>
                  </>
                )}

                {rowIndex === selectedNumericColumns.length - 1 && (
                  <text
                    x={cellSize / 2}
                    y={cellSize + 16}
                    textAnchor={'middle'}
                    fontSize={10}
                    fill={'var(--mantine-color-default-color)'}
                  >
                    {xColumn}
                    {xScaleMeta.isLogScale ? ' (log)' : ''}
                  </text>
                )}

                {rowIndex === 0 && (
                  <text
                    x={cellSize / 2}
                    y={-8}
                    textAnchor={'middle'}
                    dominantBaseline={'auto'}
                    fontSize={10}
                    fill={'var(--mantine-color-default-color)'}
                  >
                    {xColumn}
                    {xScaleMeta.isLogScale ? ' (log)' : ''}
                  </text>
                )}

                {colIndex === 0 && (
                  <text
                    x={-8}
                    y={cellSize / 2}
                    textAnchor={'end'}
                    dominantBaseline={'middle'}
                    fontSize={10}
                    fill={'var(--mantine-color-default-color)'}
                  >
                    {yColumn}
                    {yScaleMeta.isLogScale ? ' (log)' : ''}
                  </text>
                )}

                {colIndex === selectedNumericColumns.length - 1 && (
                  <text
                    x={cellSize + 8}
                    y={cellSize / 2}
                    textAnchor={'start'}
                    dominantBaseline={'middle'}
                    fontSize={10}
                    fill={'var(--mantine-color-default-color)'}
                  >
                    {yColumn}
                    {yScaleMeta.isLogScale ? ' (log)' : ''}
                  </text>
                )}
              </g>
            );
          });
        })}
      </g>
    </svg>
  );
}
