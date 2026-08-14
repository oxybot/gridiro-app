import type { Dispatch, MouseEvent, PointerEvent } from "react";
import { NodeLabel } from "./NodeLabel";
import type { AppAction, Connection, ConnectionDraft, DragState, MenuState, Node, PanState, Point } from "../diagramTypes";
import { createNode } from "../diagramNode";
import { grid, midHeight, midWidth, snapToIsoGrid } from "../diagramGeometry";

export type DiagramCanvasProps = {
  nodes: Node[];
  connections: Connection[];
  hoverPos: Point;
  isHovering: boolean;
  pan: Point;
  panning: PanState | null;
  draggingNode: DragState | null;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  dispatch: Dispatch<AppAction>;
};

export function DiagramCanvas({
  nodes,
  connections,
  hoverPos,
  isHovering,
  pan,
  panning,
  draggingNode,
  connectionDraft,
  menu,
  dispatch,
}: DiagramCanvasProps) {
  const getPointerPosition = (event: PointerEvent<SVGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const getGridPosition = (event: PointerEvent<SVGElement>) => {
    const pointerPosition = getPointerPosition(event);
    return pointerPosition ? { x: pointerPosition.x - pan.x, y: pointerPosition.y - pan.y } : null;
  };

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = { x: event.clientX - rect.left - pan.x, y: event.clientY - rect.top - pan.y };
    dispatch({ type: "setHoverPos", position: snapToIsoGrid(position.x, position.y) });
    if (connectionDraft) {
      dispatch({ type: "setConnectionDraft", connectionDraft: { ...connectionDraft, pointerPosition: position } });
    }
  };

  const closeMenu = () => dispatch({ type: "closeMenu" });

  const handleGridPointerDown = (event: PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) return;
    if (connectionDraft) {
      dispatch({ type: "setConnectionDraft", connectionDraft: null });
      return;
    }
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "setPanning", panning: { pointerPosition, startPosition: pan } });
    closeMenu();
  };

  const handleGridPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (!panning) return;
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    dispatch({ type: "setPan", pan: {
      x: panning.startPosition.x + pointerPosition.x - panning.pointerPosition.x,
      y: panning.startPosition.y + pointerPosition.y - panning.pointerPosition.y,
    } });
  };

  const handleGridPointerUp = (event: PointerEvent<SVGRectElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setPanning", panning: null });
  };

  const handleNodePointerDown = (event: PointerEvent<SVGPathElement>, node: Node) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (connectionDraft) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "setDraggingNode", draggingNode: { node, pointerOffset: { x: gridPosition.x - node.x, y: gridPosition.y - node.y } } });
    closeMenu();
  };

  const handleNodePointerMove = (event: PointerEvent<SVGPathElement>) => {
    if (!draggingNode) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const snappedPoint = snapToIsoGrid(
      gridPosition.x - draggingNode.pointerOffset.x,
      gridPosition.y - draggingNode.pointerOffset.y,
    );
    if (snappedPoint.x === draggingNode.node.x && snappedPoint.y === draggingNode.node.y) return;
    const updatedNode = { ...draggingNode.node, ...snappedPoint };
    dispatch({ type: "setDraggingNode", draggingNode: { ...draggingNode, node: updatedNode } });
    dispatch({ type: "moveNode", nodeId: draggingNode.node.id, position: snappedPoint });
  };

  const handleNodePointerUp = (event: PointerEvent<SVGPathElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setDraggingNode", draggingNode: null });
  };

  const handleNodeClick = (event: MouseEvent<SVGPathElement>, node: Node) => {
    event.stopPropagation();
    if (!connectionDraft || node.id === connectionDraft.sourceId) return;
    const connectionExists = connections.some((connection) =>
      (connection.sourceId === connectionDraft.sourceId && connection.targetId === node.id)
      || (connection.sourceId === node.id && connection.targetId === connectionDraft.sourceId),
    );
    if (!connectionExists) {
      dispatch({ type: "addConnection", connection: { sourceId: connectionDraft.sourceId, targetId: node.id } });
    }
    dispatch({ type: "setConnectionDraft", connectionDraft: null });
  };

  const handleContextMenu = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid(event.clientX - rect.left - pan.x, event.clientY - rect.top - pan.y);
    const node = nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);
    dispatch({ type: "setHoverPos", position: snappedPoint });
    dispatch({ type: "setEditingNode", editingNode: null });
    dispatch({ type: "setMenu", menu: {
      isOpen: true,
      x: snappedPoint.x,
      y: snappedPoint.y,
      side: snappedPoint.x > 2 * rect.width / 3 ? "right" : "left",
      kind: node ? "node" : "empty",
      node,
    } });
  };

  const handleDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid(event.clientX - rect.left - pan.x, event.clientY - rect.top - pan.y);
    if (!nodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y)) {
      dispatch({ type: "addNode", node: createNode(snappedPoint.x, snappedPoint.y) });
    }
    dispatch({ type: "setHoverPos", position: snappedPoint });
    dispatch({ type: "setEditingNode", editingNode: null });
    closeMenu();
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => dispatch({ type: "setHovering", isHovering: true })}
      onMouseLeave={() => dispatch({ type: "setHovering", isHovering: false })}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
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
        onPointerDown={handleGridPointerDown}
        onPointerMove={handleGridPointerMove}
        onPointerUp={handleGridPointerUp}
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
              onPointerDown={(event) => handleNodePointerDown(event, node)}
              onPointerMove={handleNodePointerMove}
              onPointerUp={handleNodePointerUp}
              onClick={(event) => handleNodeClick(event, node)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
