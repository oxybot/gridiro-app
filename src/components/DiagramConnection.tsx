import type { MouseEvent } from "react";
import { grid, midHeight, midWidth } from "../model/geometry";
import type { ElementColor, Point } from "../model/types";

type DiagramConnectionProps = {
  source: Point;
  target: Point;
  color?: ElementColor;
  dashed?: boolean;
  label?: string;
  selected?: boolean;
  draft?: boolean;
  onContextMenu?: (event: MouseEvent<SVGPathElement>) => void;
};

export function DiagramConnection({ source, target, color, dashed, label, selected, draft, onContextMenu }: DiagramConnectionProps) {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const a = deltaX / grid.width - deltaY / grid.height;
  const b = deltaX / grid.width + deltaY / grid.height;

  const d = a === 0 || b === 0
    ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
    : `M ${source.x} ${source.y}
        l ${a * midWidth / 2} ${-a * midHeight / 2},
          ${b * midWidth} ${b * midHeight},
          ${a * midWidth / 2} ${-a * midHeight / 2}`;
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  return (
    <g>
      {onContextMenu && (
        <path className="connection-hit" d={d} onContextMenu={onContextMenu} />
      )}
      <path
        className={`connection${draft ? " draft" : ""}${dashed ? " dashed" : ""}${selected ? " selected" : ""}`}
        style={color ? { stroke: color } : undefined}
        d={d}
      />
      {label && (
        <text className="connection-label" x={midX} y={midY}>{label}</text>
      )}
    </g>
  );
}

