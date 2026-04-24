import { useEffect, useRef } from "react";
import * as d3 from "d3";

type Point = { x: number; y: number };

export function DummyChart() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const width = 1000;
  const height = 800;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const points: Point[] = [
      { x: 20, y: 140 },
      { x: 80, y: 40 },
      { x: 160, y: 100 },
      { x: 240, y: 30 },
      { x: 300, y: 120 },
    ];

    const line = d3
      .line<Point>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5));

    const path = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    const hint = svg
      .append("text")
      .attr("x", 8)
      .attr("y", 16)
      .attr("font-size", 12)
      .attr("fill", "#334155")
      .text("Drag points to reshape");

    const tooltip = svg
      .append("text")
      .attr("x", 8)
      .attr("y", height - 8)
      .attr("font-size", 11)
      .attr("fill", "#0f172a")
      .style("display", "none");

    const circles = svg
      .selectAll<SVGCircleElement, Point>("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#0f172a")
      .style("cursor", "grab")
      .on("mouseenter", function (_event, d) {
        d3.select(this).attr("fill", "#2563eb");
        tooltip
          .style("display", null)
          .text(`x: ${Math.round(d.x)}, y: ${Math.round(d.y)}`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#0f172a");
        tooltip.style("display", "none");
      })
      .call(
        d3
          .drag<SVGCircleElement, Point>()
          .on("start", function () {
            d3.select(this).style("cursor", "grabbing");
            hint.text("Dragging...");
          })
          .on("drag", function (event, d) {
            d.x = clamp(event.x, 8, width - 8);
            d.y = clamp(event.y, 8, height - 8);

            d3.select(this).attr("cx", d.x).attr("cy", d.y);
            path.attr("d", line(points) ?? "");
            tooltip
              .style("display", null)
              .text(`x: ${Math.round(d.x)}, y: ${Math.round(d.y)}`);
          })
          .on("end", function () {
            d3.select(this).style("cursor", "grab");
            hint.text("Drag points to reshape");
          }),
      );

    circles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    path.attr("d", line(points) ?? "");

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0");
  }, []);

  return (
    <svg ref={svgRef} role={"img"} aria-label={"Interactive dummy plot"} />
  );
}
