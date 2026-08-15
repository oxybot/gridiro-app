import type { Dispatch, MouseEvent, PointerEvent } from "react";
import { NodeLabel } from "./NodeLabel";
import { DiagramTextLabel } from "./DiagramTextLabel";
import { DiagramSurface } from "./DiagramSurface";
import type { AppAction, Connection, ConnectionDraft, DraggingElement, EditingElement, MenuState, Node, PanState, Point, ResizingSurface, Surface, SurfaceCorner, TextElement } from "../diagramTypes";
import { createNode } from "../diagramNode";
import { grid, midHeight, midWidth, snapToIsoGrid } from "../diagramGeometry";

export type DiagramCanvasProps = {
  nodes: Node[];
  connections: Connection[];
  texts: TextElement[];
  surfaces: Surface[];
  hoverPos: Point;
  isHovering: boolean;
  pan: Point;
  panning: PanState | null;
  dragging: DraggingElement | null;
  resizingSurface: ResizingSurface | null;
  selectedSurfaceId: string | null;
  connectionDraft: ConnectionDraft | null;
  menu: MenuState;
  editing: EditingElement | null;
  dispatch: Dispatch<AppAction>;
};

export function DiagramCanvas({
  nodes,
  connections,
  texts,
  surfaces,
  hoverPos,
  isHovering,
  pan,
  panning,
  dragging,
  resizingSurface,
  selectedSurfaceId,
  connectionDraft,
  menu,
  editing,
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
    dispatch({ type: "setHoverPos", position: snapToIsoGrid(position) });
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
    dispatch({ type: "setSelectedSurface", surfaceId: null });
    closeMenu();
  };

  const handleGridPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (!panning) return;
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    dispatch({
      type: "setPan", pan: {
        x: panning.startPosition.x + pointerPosition.x - panning.pointerPosition.x,
        y: panning.startPosition.y + pointerPosition.y - panning.pointerPosition.y,
      }
    });
  };

  const handleGridPointerUp = (event: PointerEvent<SVGRectElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setPanning", panning: null });
  };

  const handleElementPointerDown = (event: PointerEvent<SVGGraphicsElement>, kind: "node" | "text" | "surface", element: Node | TextElement | Surface) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (connectionDraft) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const origin = kind === "surface"
      ? { x: (element as Surface).x1, y: (element as Surface).y1 }
      : { x: (element as Node | TextElement).x, y: (element as Node | TextElement).y };
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "setDragging", dragging: { kind, id: element.id, pointerOffset: { x: gridPosition.x - origin.x, y: gridPosition.y - origin.y } } });
    dispatch({ type: "setSelectedSurface", surfaceId: kind === "surface" ? element.id : null });
    closeMenu();
  };

  const handleElementPointerMove = (event: PointerEvent<SVGGraphicsElement>) => {
    if (!dragging) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const snappedPoint = snapToIsoGrid({
      x: gridPosition.x - dragging.pointerOffset.x,
      y: gridPosition.y - dragging.pointerOffset.y,
    });
    if (dragging.kind === "node") {
      const node = nodes.find((currentNode) => currentNode.id === dragging.id);
      if (node && node.x === snappedPoint.x && node.y === snappedPoint.y) return;
      dispatch({ type: "moveNode", nodeId: dragging.id, position: snappedPoint });
    } else if (dragging.kind === "text") {
      const text = texts.find((currentText) => currentText.id === dragging.id);
      if (text && text.x === snappedPoint.x && text.y === snappedPoint.y) return;
      dispatch({ type: "moveText", textId: dragging.id, position: snappedPoint });
    } else {
      const surface = surfaces.find((currentSurface) => currentSurface.id === dragging.id);
      if (surface && surface.x1 === snappedPoint.x && surface.y1 === snappedPoint.y) return;
      dispatch({ type: "moveSurface", surfaceId: dragging.id, position: snappedPoint });
    }
  };

  const handleElementPointerUp = (event: PointerEvent<SVGGraphicsElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setDragging", dragging: null });
  };

  const handleSurfaceCornerPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (!resizingSurface) return;

    const gridPosition = getGridPosition(event)
    const surface = surfaces.find((currentSurface) => currentSurface.id === resizingSurface.surfaceId);
    if (!gridPosition || !surface) return;
    const local = snapToIsoGrid(gridPosition);
  
    switch (resizingSurface.corner) {
      case "left":
        dispatch({ type: "updateSurface", surfaceId: surface.id, changes: { x1: local.x, y1: local.y } });
        break;
      case "right":
        dispatch({ type: "updateSurface", surfaceId: surface.id, changes: { x2: local.x, y2: local.y } });
        break;
      case "top":
      case "bottom":
        break;
    }
  };

  const handleSurfaceCornerPointerDown = (event: PointerEvent<SVGRectElement>, surface: Surface, corner: SurfaceCorner) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "setResizingSurface", resizingSurface: { surfaceId: surface.id, corner } });
  };

  const handleSurfaceCornerPointerUp = (event: PointerEvent<SVGRectElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setResizingSurface", resizingSurface: null });
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

  // Right-clicking anywhere on a text's rendered label should open its menu, not just its center cell.
  const handleTextContextMenu = (event: MouseEvent<SVGRectElement>, text: TextElement) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    dispatch({ type: "setHoverPos", position: { x: text.x, y: text.y } });
    dispatch({ type: "setEditing", editing: null });
    dispatch({
      type: "setMenu", menu: {
        isOpen: true,
        x: text.x,
        y: text.y,
        side: rect && text.x > 2 * rect.width / 3 ? "right" : "left",
        kind: "text",
        text,
      }
    });
  };

  const handleContextMenu = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid({
      x: event.clientX - rect.left - pan.x,
      y: event.clientY - rect.top - pan.y,
    });
    const node = nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);
    const text = !node ? texts.find((currentText) => currentText.x === snappedPoint.x && currentText.y === snappedPoint.y) : undefined;
    dispatch({ type: "setHoverPos", position: snappedPoint });
    dispatch({ type: "setEditing", editing: null });
    dispatch({
      type: "setMenu", menu: {
        isOpen: true,
        x: snappedPoint.x,
        y: snappedPoint.y,
        side: snappedPoint.x > 2 * rect.width / 3 ? "right" : "left",
        kind: node ? "node" : text ? "text" : "empty",
        node,
        text,
      }
    });
  };

  // Right-clicking anywhere on a surface's top face opens its own menu instead of the empty-cell menu.
  const handleSurfaceContextMenu = (event: MouseEvent<SVGPathElement>, surface: Surface) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    const localX = event.clientX - (rect?.left ?? 0) - pan.x;
    const localY = event.clientY - (rect?.top ?? 0) - pan.y;
    dispatch({ type: "setEditing", editing: null });
    dispatch({ type: "setSelectedSurface", surfaceId: surface.id });
    dispatch({
      type: "setMenu", menu: {
        isOpen: true,
        x: localX,
        y: localY,
        side: rect && localX > 2 * rect.width / 3 ? "right" : "left",
        kind: "surface",
        surface,
      }
    });
  };

  const handleDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid({
      x: event.clientX - rect.left - pan.x,
      y: event.clientY - rect.top - pan.y,
    });
    const hasElement = nodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y)
      || texts.some((text) => text.x === snappedPoint.x && text.y === snappedPoint.y);
    if (!hasElement) {
      dispatch({ type: "addNode", node: createNode(snappedPoint.x, snappedPoint.y) });
    }
    dispatch({ type: "setHoverPos", position: snappedPoint });
    dispatch({ type: "setEditing", editing: null });
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
          style={{ opacity: isHovering && !dragging ? 1 : 0 }}
        />

        {surfaces.map((surface) => (
          <g key={surface.id}>
            <DiagramSurface
              surface={surface}
              selected={selectedSurfaceId === surface.id}
              onBodyPointerDown={(event) => handleElementPointerDown(event, "surface", surface)}
              onBodyPointerMove={handleElementPointerMove}
              onBodyPointerUp={handleElementPointerUp}
              onContextMenu={(event) => handleSurfaceContextMenu(event, surface)}
              onCornerPointerDown={(event, corner) => handleSurfaceCornerPointerDown(event, surface, corner)}
              onCornerPointerMove={handleSurfaceCornerPointerMove}
              onCornerPointerUp={handleSurfaceCornerPointerUp}
            />
          </g>
        ))}

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

        {menu.isOpen && menu.kind === "empty" && (
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
              className="menu-selection"
              d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
              transform={`translate(${-midWidth} ${-midHeight})`}
              style={{ opacity: (menu.isOpen && menu.kind === "node" && menu.node?.id === node.id) || (editing?.kind === "node" && editing.node.id === node.id) ? 1 : 0 }}
            />
            <path
              className="drag-handle"
              d={`M 0 ${-midHeight} L ${midWidth} 0 0 ${midHeight} ${-midWidth} 0 Z`}
              onPointerDown={(event) => handleElementPointerDown(event, "node", node)}
              onPointerMove={handleElementPointerMove}
              onPointerUp={handleElementPointerUp}
              onClick={(event) => handleNodeClick(event, node)}
            />
          </g>
        ))}

        {texts.map((text) => (
          <g key={text.id} className="text-element" transform={`translate(${text.x} ${text.y})`}>
            <DiagramTextLabel
              text={text}
              selected={(menu.isOpen && menu.kind === "text" && menu.text?.id === text.id) || (editing?.kind === "text" && editing.text.id === text.id)}
              onPointerDown={(event) => handleElementPointerDown(event, "text", text)}
              onPointerMove={handleElementPointerMove}
              onPointerUp={handleElementPointerUp}
              onContextMenu={(event) => handleTextContextMenu(event, text)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
