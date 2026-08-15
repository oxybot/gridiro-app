import type { MouseEvent, PointerEvent } from "react";
import type { Surface, SurfaceCorner } from "../diagramTypes";
import { grid, midHeight, midWidth } from "../diagramGeometry";

const handleSize = 12;

type DiagramSurfaceProps = {
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

export function DiagramSurface({
  surface,
  selected,
  onBodyPointerDown,
  onBodyPointerMove,
  onBodyPointerUp,
  onContextMenu,
  onCornerPointerDown,
  onCornerPointerMove,
  onCornerPointerUp,
}: DiagramSurfaceProps) {

  const deltaX = surface.x2 - surface.x1;
  const deltaY = surface.y2 - surface.y1;
  const a = deltaX / grid.width - deltaY / grid.height;

  const left = { x: surface.x1, y: surface.y1 };
  const top = { x: surface.x1 + a * midWidth, y: surface.y1 - a * midHeight };
  const right = { x: surface.x2, y: surface.y2 };
  const bottom = { x: surface.x2 - a * midWidth, y: surface.y2 + a * midHeight };

  return (
    <g>
      {surface.squared ? (
        <path
          className="surface"
          d={`M ${left.x} ${left.y} L ${top.x} ${top.y}, ${right.x} ${right.y}, ${bottom.x} ${bottom.y} Z`}
          onPointerDown={onBodyPointerDown}
          onPointerMove={onBodyPointerMove}
          onPointerUp={onBodyPointerUp}
          onContextMenu={onContextMenu}
        />
      ) : (
        <path
          className="surface"
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
      {selected && (
        <rect
          className="surface-handle-move"
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
          className="surface-handle-resize"
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
