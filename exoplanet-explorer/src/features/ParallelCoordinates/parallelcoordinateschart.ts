import * as d3 from "d3";

import { hasValue } from "@/utils/util.ts";

// TODO: Replace with actual data
import { data } from "./dummydata.ts";

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
  columns,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
  columns?: string[];
}) {
  if (!svgRef.current) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  console.log(data[0]);

  // let dimensions = cfg.columns ? cfg.columns : Object.keys(data[0]); // Names of each axis
  const dimensions = columns || pcDefaultColumns; // Names of each axis
  // const errorDimName = (dim: string) => `${dim}_err`;

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

  const internalHeight = height - cfg.margin.top - cfg.margin.bottom;

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

  // Scale for the y axis
  const yScales: {
    [key: string]: d3.ScaleLinear<number, number> | d3.ScalePoint<string>;
  } = {};

  for (let i = 0; i < dimensions.length; i++) {
    const name = dimensions[i];

    let isNumber = false;
    for (const row in data) {
      const value = data[row][name];
      if (hasValue(value)) {
        // Found a value, test what it is
        isNumber = !isNaN(value);
        break;
      }
    }

    if (isNumber) {
      const values: number[] = data
        .map((d: { [x: string]: number }) => +d[name])
        .filter((d: number) => hasValue(d));
      yScales[name] = d3
        .scaleLinear()
        .domain(d3.extent(values) as [number, number])
        .range([internalHeight, 0])
        .nice();
    } else {
      // if string
      let domain: string[] = [];
      data.forEach((d: { [x: string]: string }) => {
        const value = d[name];
        if (!domain.includes(value)) {
          domain.push(value);
        }
      });
      domain = domain.sort().reverse();

      yScales[name] = d3.scalePoint().domain(domain).range([internalHeight, 0]);
    }
  }

  // Build the X scale -> it find the best position for each Y axis
  const xScale = d3.scalePoint().domain(dimensions).range([0, internalWidth]);

  /////////////////////////////////////////////////////////
  //////////////////// Draw the axes //////////////////////
  /////////////////////////////////////////////////////////

  // Draw the axes
  const axes = chart
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension")
    // Translate this element to its right position on the x axis
    .attr("transform", (d) => `translate(${xScale(d)})`);

  // Build the axis and title
  axes
    .append("g")
    .attr("class", (d) => (d.endsWith("_err") ? "axis error" : "axis"))
    .each(function (d) {
      const scale = yScales[d];
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
    .text((d: string) => d);
}
