import { grid, midHeight, midWidth } from "../diagramGeometry";
import type { Point } from "../diagramTypes";

type DiagramConnectionProps = {
  source: Point;
  target: Point;
  draft?: boolean;
};

export function DiagramConnection({ source, target, draft }: DiagramConnectionProps) {
  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const a = deltaX / grid.width - deltaY / grid.height;
  const b = deltaX / grid.width + deltaY / grid.height;

  if (a === 0 || b === 0) {
    return (
      <line
        className={`connection${draft ? " draft" : ""}`}
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
      />
    );
  } else {
    return (
      <path
        className={`connection${draft ? " draft" : ""}`}
        d={`M ${source.x} ${source.y}
            l ${a * midWidth / 2} ${-a * midHeight / 2},
              ${b * midWidth} ${b * midHeight},
              ${a * midWidth / 2} ${-a * midHeight / 2}`}
      />
    );
  }
}
