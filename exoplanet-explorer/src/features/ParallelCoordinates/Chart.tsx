import { useEffect, useRef } from "react";
import * as d3 from "d3";

import { hasValue } from "@/utils/util.ts";

import { type DataItem, type Dimension, inferDimensions } from "./util.ts";

const pcDefaultColumns = [
  "discoverymethod",
  "sy_pnum",
  "pl_bmasse",
  "pl_rade",
  "pl_orbincl",
  "pl_Teq",
  "sy_dist",
  "st_spectype",
  "st_age",
];

function Axis({
  dimension,
  x,
  nanAxisYPos,
}: {
  dimension: Dimension;
  x: number;
  nanAxisYPos: number;
}) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const { scale } = dimension;
    const axis =
      "ticks" in scale
        ? d3.axisLeft<number>(scale)
        : d3.axisLeft<string>(scale);

    d3.select(ref.current).call(axis);
  }, [dimension]);

  return (
    <g ref={ref} transform={`translate(${x},0)`}>
      {/* Axis label */}
      <text
        className={"legend"}
        y={-9}
        fontSize={"11px"}
        fill={"var(--mantine-color-default-color)"}
        transform={"rotate(-21)"}
        textAnchor={"start"}
      >
        {dimension.key}
      </text>
      {/* NaN axis */}
      <circle cx={0} cy={nanAxisYPos} r={4} fill={"darkgray"} />
    </g>
  );
}

function MissingValueAxisLabel({
  yPos,
  width,
  showUncertaintyLabel = true,
}: {
  yPos: number;
  width: number;
  showUncertaintyLabel?: boolean;
}) {
  const textPositionX = -20;
  const lineY = yPos + 15;
  const xExtend = 30;

  const line = d3.line()([
    [0 - xExtend, lineY],
    [width + xExtend, lineY],
  ]);

  return (
    <>
      <path d={line || undefined} stroke={"darkgray"} strokeWidth={0.4} />
      <g>
        <text
          className={"legend"}
          x={textPositionX}
          y={lineY}
          dy={-10}
          fontSize={"11px"}
          fill={"var(--mantine-color-default-color)"}
          textAnchor={"end"}
        >
          Missing values
        </text>
        {showUncertaintyLabel && (
          <text
            x={textPositionX}
            y={lineY}
            dy={17}
            fontSize={"11px"}
            fill={"var(--mantine-color-default-color)"}
            textAnchor={"end"}
          >
            Uncertainty axis
          </text>
        )}
      </g>
    </>
  );
}

export function ParallelCoordinatesChart({
  data,
  width,
  height,
  cfg = {
    strokeWidth: 1, // The width of the stroke around each blob
    lineOpacity: 1.0, // Opacity of each line in the plot
  },
}: {
  data: DataItem[];
  width: number;
  height: number;
  cfg?: {
    strokeWidth?: number;
    lineOpacity?: number;
  };
}) {
  console.log(data[0]);

  /////////////////////////////////////////////////////////
  //////////// Create the container SVG and g /////////////
  /////////////////////////////////////////////////////////

  // Extra margin for the left to fit the longest y axis labels
  const extraLeftMargin = 100;
  const extraRightMargin = 50;

  const margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  };

  const internalWidth =
    width - margin.left - extraLeftMargin - margin.right - extraRightMargin;

  const extraHeight = 60; // Extra height to place the NaN axis

  const internalHeight = height - margin.top - margin.bottom - extraHeight;

  const dimensions: Dimension[] = inferDimensions(
    data,
    pcDefaultColumns,
    internalHeight,
  );

  const xScale = d3
    .scalePoint<string>()
    .domain(dimensions.map((d) => d.key))
    .range([0, internalWidth]);

  /////////////////////////////////////////////////////////
  //////////////////// Line drawing ///////////////////////
  /////////////////////////////////////////////////////////
  const nanAxisYPos = 1.1 * internalHeight;

  const line = d3.line<[number, number]>();

  function yPos(d: DataItem, dim: Dimension): number {
    if (dim.type === "number") {
      const isMissing = !hasValue(d[dim.key]) || isNaN(Number(d[dim.key]));
      return isMissing ? nanAxisYPos : dim.scale(Number(d[dim.key]));
    }

    const isEmpty = d[dim.key] == null || String(d[dim.key]) === "";
    return isEmpty ? nanAxisYPos : dim.scale(String(d[dim.key]))!;
  }

  function path(row: DataItem) {
    const points: [number, number][] = dimensions.map((dim) => {
      const x = xScale(dim.key)!;
      const y = yPos(row, dim);
      return [x, y];
    });

    return line(points);
  }

  return (
    <svg width={width} height={height}>
      <g
        transform={`translate(${margin.left + extraLeftMargin}, ${margin.top})`}
      >
        {/* Foreground lines (colored) */}
        {data.map((d, i) => (
          <path
            key={i}
            d={path(d) ?? undefined}
            fill={"none"}
            stroke={"steelblue"}
            opacity={cfg.lineOpacity}
            strokeWidth={cfg.strokeWidth}
            // style={{ filter: "drop-shadow( 1px 1px 1px rgba(0, 0, 0, .1))" }}
          />
        ))}
        {/* Axes */}
        <g className={"axes"}>
          {dimensions.map((dim) => (
            <Axis
              key={dim.key}
              dimension={dim}
              x={xScale(dim.key)!}
              nanAxisYPos={nanAxisYPos}
            />
          ))}
        </g>
        {/* NaN axis line and label */}
        <MissingValueAxisLabel yPos={nanAxisYPos} width={internalWidth} />
      </g>
    </svg>
  );
}
