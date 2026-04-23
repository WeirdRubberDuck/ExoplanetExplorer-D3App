import * as d3 from "d3";

import { hasValue } from "@/utils/util.ts";

import { dymmyData } from "./dummydata.ts"; // TODO: Replace with actual data
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

const cfg = {
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  }, // The margins of the SVG
  strokeWidth: 2, // The width of the stroke around each blob
  titleFactor: 1.1, // How much farther than the height of the axes should the title be placed
  color: d3.scaleOrdinal(d3.schemeCategory10), // Color function. Based on id of data item
  lineOpacity: 1.0, // Opacity of each line in the plot
};

export function makeParallelCoordinatesChart({
  svgRef,
  width,
  height,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
}) {
  if (!svgRef.current) {
    return;
  }

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const data = dymmyData as DataItem[];
  console.log(data[0]);

  /////////////////////////////////////////////////////////
  //////////// Create the container SVG and g /////////////
  /////////////////////////////////////////////////////////

  // Extra margin for the left to fit the longest y axis labels
  const extraLeftMargin = 100;
  const extraRightMargin = 50;

  const internalWidth =
    width -
    cfg.margin.left -
    extraLeftMargin -
    cfg.margin.right -
    extraRightMargin;

  const extraHeight = 100; // Extra height to place the NaN axis

  const internalHeight =
    height - cfg.margin.top - cfg.margin.bottom - extraHeight;

  // Initiate the chart SVG
  const chart = svg
    .attr("width", width)
    .attr("height", height)
    .attr("class", "parallel")
    .append("g")
    .attr(
      "transform",
      `translate(${cfg.margin.left + extraLeftMargin}, ${cfg.margin.top})`,
    );

  /////////////////////////////////////////////////////////
  ////////////////// Scales for axes //////////////////////
  /////////////////////////////////////////////////////////

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
  //////////////////// Draw the lines //////////////////////
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

  // Foreground lines (colored)
  const foreground = chart
    .selectAll(".myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "steelblue")
    .style("opacity", cfg.lineOpacity)
    .style("stroke-width", cfg.strokeWidth + "px");

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  const axes = chart
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${xScale(d.key)},0)`)
    .each(function (d) {
      const { scale } = d;
      const axis =
        "ticks" in scale
          ? d3.axisLeft<number>(scale)
          : d3.axisLeft<string>(scale);

      d3.select(this).call(axis);
    })
    .append("text")
    .attr("class", "legend")
    .style("fill", "white") // TODO: need to use theme color here
    .style("text-anchor", "start")
    .style("font-size", "11px")
    .attr("transform", "rotate(-21)")
    .attr("y", -9)
    .text((d) => d.key);
}
