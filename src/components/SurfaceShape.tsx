import type { MouseEvent, PointerEvent } from "react";
import type { Surface, SurfaceCorner } from "../model/types";
import { grid, midHeight, midWidth } from "../model/geometry";

const handleSize = 12;

type SurfaceShapeProps = {
  surface: Surface;
  selected: boolean;
  onBodyPointerDown: (event: PointerEvent<SVGPathElement>) => void;
  onBodyPointerMove: (event: PointerEvent<SVGPathElement>) => void;
  onBodyPointerUp: (event: PointerEvent<SVGPathElement>) => void;
  onContextMenu: (event: MouseEvent<SVGPathElement>) => void;
  onCornerPointerDown: (event: PointerEvent<SVGRectElement>, corner: SurfaceCorner) => void;
  onCornerPointerMove: (event: PointerEvent<SVGRectElement>) => void;
  onCornerPointerUp: (event: PointerEvent<SVGRectElement>) => void;
};

export function SurfaceShape({
  surface,
  selected,
  onBodyPointerDown,
  onBodyPointerMove,
  onBodyPointerUp,
  onContextMenu,
  onCornerPointerDown,
  onCornerPointerMove,
  onCornerPointerUp,
}: SurfaceShapeProps) {

  const deltaX = surface.x2 - surface.x1;
  const deltaY = surface.y2 - surface.y1;
  const a = deltaX / grid.width - deltaY / grid.height;

  const left = { x: 0, y: 0 };
  const top = { x: a * midWidth, y: - a * midHeight };
  const right = { x: deltaX, y: deltaY };
  const bottom = { x: deltaX - a * midWidth, y: deltaY + a * midHeight };

  return (
    <g transform={`translate(${surface.x1}, ${surface.y1})`}>
      {surface.squared ? (
        <path
          className="surface"
          style={{ fill: surface.backgroundColor }}
          d={`M ${left.x} ${left.y} L ${top.x} ${top.y}, ${right.x} ${right.y}, ${bottom.x} ${bottom.y} Z`}
          onPointerDown={onBodyPointerDown}
          onPointerMove={onBodyPointerMove}
          onPointerUp={onBodyPointerUp}
          onContextMenu={onContextMenu}
        />
      ) : (
        <path
          className="surface"
          style={{ fill: surface.backgroundColor }}
          d={`M ${left.x + midWidth / 2} ${left.y + midHeight / 2} l 0 ${-midHeight}
            L ${top.x - midWidth / 2} ${top.y + midHeight / 2} l ${midWidth} 0
            L ${right.x - midWidth / 2} ${right.y - midHeight / 2} l 0 ${midHeight}
            L ${bottom.x + midWidth / 2} ${bottom.y - midHeight / 2} l ${-midWidth} 0 Z`}
          onPointerDown={onBodyPointerDown}
          onPointerMove={onBodyPointerMove}
          onPointerUp={onBodyPointerUp}
          onContextMenu={onContextMenu}
        />
      )}
      {surface.label && (
        <>
          <line className="surface-label-line"
            x1={bottom.x - midWidth} y1={bottom.y - midHeight}
            x2={right.x - midWidth} y2={right.y - midHeight} />
          <g transform={`translate(${right.x - (a + 1) * midWidth / 2}, ${right.y + (a - 1) * midHeight / 2})`}>
            <text
              transform={`scale(1 ${grid.height / grid.width}) rotate(-45)`}
              className="surface-label"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {surface.label}
            </text>
          </g>
        </>
      )}
      {selected && (
        <rect
          className="surface-handle"
          x={left.x - handleSize / 2}
          y={left.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          onPointerDown={(event) => onCornerPointerDown(event, "left")}
          onPointerMove={onCornerPointerMove}
          onPointerUp={onCornerPointerUp}
        />
      )}
      {selected && (
        <rect
          className="surface-handle"
          x={right.x - handleSize / 2}
          y={right.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          onPointerDown={(event) => onCornerPointerDown(event, "right")}
          onPointerMove={onCornerPointerMove}
          onPointerUp={onCornerPointerUp}
        />
      )}
    </g>
  );
}
