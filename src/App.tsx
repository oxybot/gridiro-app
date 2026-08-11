import { useState } from "react";

export default function App() {
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const grid = {
    width: 80,
    height: 60,
  };

  const midWidth = grid.width / 2;
  const midHeight = grid.height / 2;

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    // Snap against an isometric lattice instead of independent x/y spacing.
    const offsetX = localX - midWidth;
    const offsetY = localY - midHeight;

    const isoU = (offsetX / midWidth + offsetY / midHeight) / 2;
    const isoV = (offsetX / midWidth - offsetY / midHeight) / 2;

    const snappedU = Math.round(isoU);
    const snappedV = Math.round(isoV);

    const snappedX = (snappedU + snappedV) * midWidth + midWidth;
    const snappedY = (snappedU - snappedV) * midHeight + midHeight;

    setHoverPos({
      x: snappedX,
      y: snappedY,
    });
  };

  return (
    <>
      <section>
        <h1>Welcome to the Gridiro Hackathon App</h1>
      </section>
      <section className="diagram">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          <defs>
            <pattern id="grid" width={grid.width} height={grid.height} patternUnits="userSpaceOnUse">
              <path className="grid" d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path
            className="hover"
            d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
            transform={`translate(${hoverPos.x - midWidth} ${hoverPos.y - midHeight})`}
            style={{ opacity: isHovering ? 1 : 0 }}
          />
        </svg>
      </section>
    </>
  )
}
