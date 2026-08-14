import type { MouseEvent, PointerEvent } from "react";
import { NodeLabel } from "./NodeLabel";
import type { Connection, ConnectionDraft, MenuState, Node } from "../diagramTypes";
import { grid, midHeight, midWidth } from "../diagramGeometry";

export type DiagramCanvasProps = {
  nodes: Node[];
  connections: Connection[];
  hoverPos: { x: number; y: number };
  isHovering: boolean;
  pan: { x: number; y: number };
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseMove: (event: MouseEvent<SVGSVGElement>) => void;
  onContextMenu: (event: MouseEvent<SVGSVGElement>) => void;
  onDoubleClick: (event: MouseEvent<SVGSVGElement>) => void;
  onGridPointerDown: (event: PointerEvent<SVGRectElement>) => void;
  onGridPointerMove: (event: PointerEvent<SVGRectElement>) => void;
  onGridPointerUp: (event: PointerEvent<SVGRectElement>) => void;
  onNodePointerDown: (event: PointerEvent<SVGPathElement>, node: Node) => void;
  onNodePointerMove: (event: PointerEvent<SVGPathElement>) => void;
  onNodePointerUp: (event: PointerEvent<SVGPathElement>) => void;
  onNodeClick: (event: MouseEvent<SVGPathElement>, node: Node) => void;
};

export function DiagramCanvas({
  nodes,
  connections,
  hoverPos,
  isHovering,
  pan,
  connectionDraft,
  menu,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onContextMenu,
  onDoubleClick,
  onGridPointerDown,
  onGridPointerMove,
  onGridPointerUp,
  onNodePointerDown,
  onNodePointerMove,
  onNodePointerUp,
  onNodeClick,
}: DiagramCanvasProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
    >
      <defs>
        <pattern
          id="grid"
          width={grid.width}
          height={grid.height}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${pan.x} ${pan.y})`}
        >
          <path className="grid" d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`} />
        </pattern>
      </defs>
      <rect
        className="grid-surface"
        width="100%"
        height="100%"
        fill="url(#grid)"
        onPointerDown={onGridPointerDown}
        onPointerMove={onGridPointerMove}
        onPointerUp={onGridPointerUp}
      />

      <g transform={`translate(${pan.x} ${pan.y})`}>
        <path
          className="hover"
          d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
          transform={`translate(${hoverPos.x - midWidth} ${hoverPos.y - midHeight})`}
          style={{ opacity: isHovering ? 1 : 0 }}
        />

        {connections.map((connection) => {
          const source = nodes.find((node) => node.id === connection.sourceId);
          const target = nodes.find((node) => node.id === connection.targetId);
          if (!source || !target) {
            return null;
          }

          return (
            <line
              className="connection"
              key={`${connection.sourceId}-${connection.targetId}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
            />
          );
        })}
        {connectionDraft && (() => {
          const source = nodes.find((node) => node.id === connectionDraft.sourceId);
          if (!source) {
            return null;
          }

          return (
            <line
              className="connection draft"
              x1={source.x}
              y1={source.y}
              x2={connectionDraft.pointerPosition.x}
              y2={connectionDraft.pointerPosition.y}
            />
          );
        })()}

        {menu.isOpen && (
          <path
            className="menu-selection"
            d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
            transform={`translate(${menu.x - midWidth} ${menu.y - midHeight})`}
          />
        )}

        {nodes.map((node) => (
          <g key={node.id} className="node" transform={`translate(${node.x} ${node.y})`}>
            <ellipse cx="0" cy="0" rx={0.3 * midWidth} ry={0.3 * midHeight} stroke="black" fill="white" />
            <line className="node-label-line" y2={-1.3 * grid.height} />
            <image
              className="node-icon"
              href={node.icon.url}
              x={-midWidth}
              y={midHeight - (node.icon.height / node.icon.width * grid.width)}
              width={grid.width}
              preserveAspectRatio="xMidYMax meet"
            />
            <NodeLabel label={node.label} y={-1.3 * grid.height} />
            <path
              className="node-drag-handle"
              d={`M 0 ${-midHeight} L ${midWidth} 0 0 ${midHeight} ${-midWidth} 0 Z`}
              onPointerDown={(event) => onNodePointerDown(event, node)}
              onPointerMove={onNodePointerMove}
              onPointerUp={onNodePointerUp}
              onClick={(event) => onNodeClick(event, node)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
