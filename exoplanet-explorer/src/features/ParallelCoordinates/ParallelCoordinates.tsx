import { useEffect, useRef } from "react";

import { makeInteractiveDummyChart } from "./dummychart";

export function ParallelCoordinates() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    makeInteractiveDummyChart({ svgRef, width: 320, height: 180 });
  }, []);

  return (
    <svg
      ref={svgRef}
      width={320}
      height={180}
      role={"img"}
      aria-label={"Interactive D3 line shape"}
    />
  );
}
