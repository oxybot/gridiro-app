import type { Dispatch, MouseEvent, PointerEvent } from "react";
import { NodeLabel } from "./NodeLabel";
import { DiagramTextLabel } from "./DiagramTextLabel";
import { DiagramSurface } from "./DiagramSurface";
import { DiagramConnection } from "./DiagramConnection";
import type { AppAction, AppState, Node, Surface, SurfaceCorner, TextElement } from "../model/types";
import { createNode } from "../model/node";
import { grid, midHeight, midWidth, snapToIsoGrid, zoomLevels } from "../model/geometry";

export type DiagramCanvasProps = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

export function DiagramCanvas({
  state,
  dispatch,
}: DiagramCanvasProps) {
  const zoom = zoomLevels[state.zoomIndex];

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
    return pointerPosition ? { x: (pointerPosition.x - state.pan.x) / zoom, y: (pointerPosition.y - state.pan.y) / zoom } : null;
  };

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = { x: (event.clientX - rect.left - state.pan.x) / zoom, y: (event.clientY - rect.top - state.pan.y) / zoom };
    dispatch({ type: "setHoverPos", position: snapToIsoGrid(position) });
    if (state.connectionDraft) {
      dispatch({ type: "setConnectionDraft", connectionDraft: { ...state.connectionDraft, pointerPosition: position } });
    }
  };

  const closeMenu = () => dispatch({ type: "closeMenu" });

  const handleGridPointerDown = (event: PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) return;
    if (state.connectionDraft) {
      dispatch({ type: "setConnectionDraft", connectionDraft: null });
      return;
    }
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "setPanning", panning: { pointerPosition, startPosition: state.pan } });
    dispatch({ type: "setSelectedSurface", surfaceId: null });
    closeMenu();
  };

  const handleGridPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (!state.panning) return;
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    dispatch({
      type: "setPan", pan: {
        x: state.panning.startPosition.x + pointerPosition.x - state.panning.pointerPosition.x,
        y: state.panning.startPosition.y + pointerPosition.y - state.panning.pointerPosition.y,
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
    if (state.connectionDraft) return;
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
    const dragging = state.dragging;
    if (!dragging) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const snappedPoint = snapToIsoGrid({
      x: gridPosition.x - dragging.pointerOffset.x,
      y: gridPosition.y - dragging.pointerOffset.y,
    });
    if (dragging.kind === "node") {
      const node = state.nodes.find((currentNode) => currentNode.id === dragging.id);
      if (node && node.x === snappedPoint.x && node.y === snappedPoint.y) return;
      dispatch({ type: "moveNode", nodeId: dragging.id, position: snappedPoint });
    } else if (dragging.kind === "text") {
      const text = state.texts.find((currentText) => currentText.id === dragging.id);
      if (text && text.x === snappedPoint.x && text.y === snappedPoint.y) return;
      dispatch({ type: "moveText", textId: dragging.id, position: snappedPoint });
    } else {
      const surface = state.surfaces.find((currentSurface) => currentSurface.id === dragging.id);
      if (surface && surface.x1 === snappedPoint.x && surface.y1 === snappedPoint.y) return;
      dispatch({ type: "moveSurface", surfaceId: dragging.id, position: snappedPoint });
    }
  };

  const handleElementPointerUp = (event: PointerEvent<SVGGraphicsElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatch({ type: "setDragging", dragging: null });
  };

  const handleSurfaceCornerPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const resizingSurface = state.resizingSurface;
    if (!resizingSurface) return;

    const gridPosition = getGridPosition(event)
    const surface = state.surfaces.find((currentSurface) => currentSurface.id === resizingSurface.surfaceId);
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
    const connectionDraft = state.connectionDraft;
    if (!connectionDraft || node.id === connectionDraft.sourceId) return;
    const connectionExists = state.connections.some((connection) =>
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
      x: (event.clientX - rect.left - state.pan.x) / zoom,
      y: (event.clientY - rect.top - state.pan.y) / zoom,
    });
    const node = state.nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);
    const text = !node ? state.texts.find((currentText) => currentText.x === snappedPoint.x && currentText.y === snappedPoint.y) : undefined;
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
    const localX = (event.clientX - (rect?.left ?? 0) - state.pan.x) / zoom;
    const localY = (event.clientY - (rect?.top ?? 0) - state.pan.y) / zoom;
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
      x: (event.clientX - rect.left - state.pan.x) / zoom,
      y: (event.clientY - rect.top - state.pan.y) / zoom,
    });
    const hasElement = state.nodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y)
      || state.texts.some((text) => text.x === snappedPoint.x && text.y === snappedPoint.y);
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
          patternTransform={`translate(${state.pan.x} ${state.pan.y}) scale(${zoom})`}
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

      <g transform={`translate(${state.pan.x} ${state.pan.y}) scale(${zoom})`}>
        <path
          className="hover"
          d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
          transform={`translate(${state.hoverPos.x - midWidth} ${state.hoverPos.y - midHeight})`}
          style={{ opacity: state.isHovering && !state.dragging ? 1 : 0 }}
        />

        {state.surfaces.map((surface) => (
          <g key={surface.id}>
            <DiagramSurface
              surface={surface}
              selected={state.selectedSurfaceId === surface.id}
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

        {state.connections.map((connection) => {
          const source = state.nodes.find((node) => node.id === connection.sourceId);
          const target = state.nodes.find((node) => node.id === connection.targetId);
          if (!source || !target) {
            return null;
          }

          return (
            <DiagramConnection
              key={`${connection.sourceId}-${connection.targetId}`}
              source={source}
              target={target}
            />
          );
        })}
        {state.connectionDraft && (() => {
          const source = state.nodes.find((node) => node.id === state.connectionDraft!.sourceId);
          if (!source) {
            return null;
          }

          return (
            <DiagramConnection source={source} target={state.connectionDraft.pointerPosition} draft />
          );
        })()}

        {state.menu.isOpen && state.menu.kind === "empty" && (
          <path
            className="menu-selection"
            d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
            transform={`translate(${state.menu.x - midWidth} ${state.menu.y - midHeight})`}
          />
        )}

        {state.nodes.map((node) => (
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
              style={{ opacity: (state.menu.isOpen && state.menu.kind === "node" && state.menu.node?.id === node.id) || (state.editing?.kind === "node" && state.editing.node.id === node.id) ? 1 : 0 }}
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

        {state.texts.map((text) => (
          <g key={text.id} className="text-element" transform={`translate(${text.x} ${text.y})`}>
            <DiagramTextLabel
              text={text}
              selected={(state.menu.isOpen && state.menu.kind === "text" && state.menu.text?.id === text.id) || (state.editing?.kind === "text" && state.editing.text.id === text.id)}
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
