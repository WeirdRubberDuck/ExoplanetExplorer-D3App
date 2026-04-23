import { useEffect, useRef } from "react";
import { Box } from "@mantine/core";
import { useResizeObserver, useViewportSize } from "@mantine/hooks";

import { makeInteractiveDummyChart } from "./dummychart";
import { makeParallelCoordinatesChart } from "./parallelcoordinateschart";

export function ParallelCoordinates() {
  const [containerRef, container] = useResizeObserver();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgDummyRef = useRef<SVGSVGElement | null>(null);

  const { width, height } = useViewportSize();

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
        width: container ? container.width : 400,
        height: container ? container.height : 400,
      });
    }
  }, [container, width]);

  return (
    <>
      <Box
        style={{
          resize: "vertical",
          height: 800,
          maxHeight: height,
          minHeight: 200,
          overflow: "hidden",
        }}
        ref={containerRef}
      >
        <svg
          ref={svgRef}
          role={"img"}
          aria-label={"Interactive parallel coordinates plot"}
        />
      </Box>
      <svg
        ref={svgDummyRef}
        role={"img"}
        aria-label={"Interactive dummy plot"}
      />
    </>
  );
}
