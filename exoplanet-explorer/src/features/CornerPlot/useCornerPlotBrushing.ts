import { type MouseEvent, useRef, useState } from 'react';

import type { Column } from '@/types/types';

import {
  type ActiveBrush,
  type BrushDraft,
  clampToCell,
  getCellKey,
  getTranslatedBrush,
  type MovingBrushDraft
} from './helpers';

const MIN_BRUSH_MOVE_INTERVAL_MS = 16;

interface Params {
  cellSize: number;
  marginLeft: number;
  marginTop: number;
}

interface ReturnValue {
  brushDraft: BrushDraft | undefined;
  activeBrushes: ActiveBrush[];
  movingBrushDraft: MovingBrushDraft | undefined;
  onBrushStart: (
    event: MouseEvent<SVGRectElement>,
    xColumn: Column,
    yColumn: Column,
    xOffset: number,
    yOffset: number
  ) => void;
  onBrushMove: (event: MouseEvent<SVGSVGElement>) => void;
  onBrushDragStart: (event: MouseEvent<SVGRectElement>, brushIndex: number) => void;
  onBrushEnd: () => void;
  clearBrushesForCell: (xColumn: Column, yColumn: Column) => void;
  resetBrushing: () => void;
}

export function useCornerPlotBrushing({
  cellSize,
  marginLeft,
  marginTop
}: Params): ReturnValue {
  const [brushDraft, setBrushDraft] = useState<BrushDraft | undefined>(undefined);
  const [activeBrushes, setActiveBrushes] = useState<ActiveBrush[]>([]);
  const [movingBrushDraft, setMovingBrushDraft] = useState<MovingBrushDraft | undefined>(
    undefined
  );
  const lastBrushMoveTsRef = useRef(0);

  function onBrushStart(
    event: MouseEvent<SVGRectElement>,
    xColumn: Column,
    yColumn: Column,
    xOffset: number,
    yOffset: number
  ) {
    const localX = clampToCell(
      event.nativeEvent.offsetX - marginLeft - xOffset,
      cellSize
    );
    const localY = clampToCell(event.nativeEvent.offsetY - marginTop - yOffset, cellSize);

    setBrushDraft({
      cellKey: getCellKey(xColumn, yColumn),
      xColumn,
      yColumn,
      xOffset,
      yOffset,
      x0: localX,
      y0: localY,
      x1: localX,
      y1: localY,
      appendToExisting: !event.altKey
    });
  }

  function onBrushMove(event: MouseEvent<SVGSVGElement>) {
    const plotX = event.nativeEvent.offsetX - marginLeft;
    const plotY = event.nativeEvent.offsetY - marginTop;

    if (movingBrushDraft) {
      const dx = plotX - movingBrushDraft.startPlotX;
      const dy = plotY - movingBrushDraft.startPlotY;

      setMovingBrushDraft((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          dx,
          dy
        };
      });
      return;
    }

    if (!brushDraft) {
      return;
    }

    if (event.timeStamp - lastBrushMoveTsRef.current < MIN_BRUSH_MOVE_INTERVAL_MS) {
      return;
    }
    lastBrushMoveTsRef.current = event.timeStamp;

    const localX = clampToCell(
      event.nativeEvent.offsetX - marginLeft - brushDraft.xOffset,
      cellSize
    );
    const localY = clampToCell(
      event.nativeEvent.offsetY - marginTop - brushDraft.yOffset,
      cellSize
    );

    setBrushDraft((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        x1: localX,
        y1: localY
      };
    });
  }

  function onBrushDragStart(event: MouseEvent<SVGRectElement>, brushIndex: number) {
    event.stopPropagation();
    event.preventDefault();

    const brush = activeBrushes[brushIndex];
    if (!brush) {
      return;
    }

    const plotX = event.nativeEvent.offsetX - marginLeft;
    const plotY = event.nativeEvent.offsetY - marginTop;

    setMovingBrushDraft({
      brushIndex,
      startPlotX: plotX,
      startPlotY: plotY,
      originBrush: brush,
      dx: 0,
      dy: 0
    });
  }

  function onBrushEnd() {
    if (movingBrushDraft) {
      const movedBrush = getTranslatedBrush(movingBrushDraft, cellSize);
      setActiveBrushes((current) => {
        const next = current.slice();
        if (!next[movingBrushDraft.brushIndex]) {
          return current;
        }
        next[movingBrushDraft.brushIndex] = movedBrush;
        return next;
      });
      setMovingBrushDraft(undefined);
      return;
    }

    if (!brushDraft) {
      return;
    }

    const minX = Math.min(brushDraft.x0, brushDraft.x1);
    const maxX = Math.max(brushDraft.x0, brushDraft.x1);
    const minY = Math.min(brushDraft.y0, brushDraft.y1);
    const maxY = Math.max(brushDraft.y0, brushDraft.y1);

    const minDragDistance = 4;
    if (maxX - minX < minDragDistance || maxY - minY < minDragDistance) {
      setBrushDraft(undefined);
      return;
    }

    const newBrush: ActiveBrush = {
      cellKey: brushDraft.cellKey,
      xColumn: brushDraft.xColumn,
      yColumn: brushDraft.yColumn,
      minX,
      minY,
      maxX,
      maxY
    };

    const nextBrushes = brushDraft.appendToExisting
      ? [...activeBrushes, newBrush]
      : [newBrush];

    setActiveBrushes(nextBrushes);
    setBrushDraft(undefined);
  }

  function clearBrushesForCell(xColumn: Column, yColumn: Column) {
    const cellKey = getCellKey(xColumn, yColumn);
    setActiveBrushes((current) => current.filter((brush) => brush.cellKey !== cellKey));
    setBrushDraft((current) => (current?.cellKey === cellKey ? undefined : current));
    setMovingBrushDraft((current) =>
      current?.originBrush.cellKey === cellKey ? undefined : current
    );
  }

  function resetBrushing() {
    setActiveBrushes([]);
    setBrushDraft(undefined);
    setMovingBrushDraft(undefined);
  }

  return {
    brushDraft,
    activeBrushes,
    movingBrushDraft,
    onBrushStart,
    onBrushMove,
    onBrushDragStart,
    onBrushEnd,
    clearBrushesForCell,
    resetBrushing
  };
}
