import { useEffect, useRef } from "react";
import { useViewportSize } from "@mantine/hooks";

import { makeInteractiveDummyChart } from "./dummychart";
import { makeParallelCoordinatesChart } from "./parallelcoordinateschart";

export function ParallelCoordinates() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgDummyRef = useRef<SVGSVGElement | null>(null);

  const { width } = useViewportSize();

  useEffect(() => {
    if (svgDummyRef.current) {
      makeInteractiveDummyChart({
        svgRef: svgDummyRef,
        width,
        height: 200,
      });
    }

    if (svgRef.current) {
      makeParallelCoordinatesChart({
        svgRef,
        width,
        height: 800,
      });
    }
  }, [width]);

  return (
    <>
      <svg
        ref={svgRef}
        role={"img"}
        aria-label={"Interactive parallel coordinates plot"}
      />

      <svg
        ref={svgDummyRef}
        role={"img"}
        aria-label={"Interactive dummy plot"}
      />
    </>
  );
}
