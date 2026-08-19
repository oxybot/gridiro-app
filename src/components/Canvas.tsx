import type { MouseEvent, PointerEvent } from "react";
import { NodeLabel } from "./NodeLabel";
import { TextLabel } from "./TextLabel";
import { SurfaceShape } from "./SurfaceShape";
import { ConnectionLine } from "./ConnectionLine";
import type { Connection, Node, SelectedElement, Surface, SurfaceCorner, TextElement } from "../model/types";
import { createNode } from "../model/node";
import { createConnection } from "../model/connection";
import { grid, midHeight, midWidth, snapToIsoGrid, zoomLevels } from "../model/geometry";
import { useDocumentDispatch, useDocumentState, useViewDispatch, useViewState } from "../state/DiagramProvider";
import { getSurfaceBounds } from "../model/surface";

export function Canvas() {
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const view = useViewState();
  const dispatchView = useViewDispatch();
  const zoom = zoomLevels[view.zoomIndex];

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
    return pointerPosition ? { x: (pointerPosition.x - view.pan.x) / zoom, y: (pointerPosition.y - view.pan.y) / zoom } : null;
  };

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = { x: (event.clientX - rect.left - view.pan.x) / zoom, y: (event.clientY - rect.top - view.pan.y) / zoom };
    dispatchView({ type: "setHoverPos", position: snapToIsoGrid(position) });
    if (view.connectionDraft) {
      dispatchView({ type: "setConnectionDraft", connectionDraft: { ...view.connectionDraft, pointerPosition: position } });
    }
  };

  const closeMenu = () => dispatchView({ type: "closeMenu" });

  const getElementOrigin = (kind: SelectedElement["kind"], element: Node | TextElement | Surface) =>
    kind === "surface"
      ? { x: (element as Surface).x1, y: (element as Surface).y1 }
      : { x: (element as Node | TextElement).x, y: (element as Node | TextElement).y };

  const getElementBounds = (kind: SelectedElement["kind"], element: Node | TextElement | Surface) => {
    if (kind === "surface") {
      return getSurfaceBounds(element as Surface);
    }

    const point = element as Node | TextElement;
    return kind === "node"
      ? { minX: point.x - midWidth, minY: point.y - midHeight, maxX: point.x + midWidth, maxY: point.y + midHeight }
      : { minX: point.x - grid.width, minY: point.y - grid.height, maxX: point.x + grid.width, maxY: point.y + grid.height };
  };

  const getMarqueeSelection = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const bounds = { minX: Math.min(start.x, end.x), minY: Math.min(start.y, end.y), maxX: Math.max(start.x, end.x), maxY: Math.max(start.y, end.y) };
    const isContained = (elementBounds: ReturnType<typeof getElementBounds>) =>
      elementBounds.minX >= bounds.minX
      && elementBounds.minY >= bounds.minY
      && elementBounds.maxX <= bounds.maxX
      && elementBounds.maxY <= bounds.maxY;

    return [
      ...documentState.nodes.filter((node) => isContained(getElementBounds("node", node))).map((node) => ({ kind: "node" as const, id: node.id })),
      ...documentState.texts.filter((text) => isContained(getElementBounds("text", text))).map((text) => ({ kind: "text" as const, id: text.id })),
      ...documentState.surfaces.filter((surface) => isContained(getElementBounds("surface", surface))).map((surface) => ({ kind: "surface" as const, id: surface.id })),
    ];
  };

  const handleGridPointerDown = (event: PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) return;
    if (view.connectionDraft) {
      dispatchView({ type: "setConnectionDraft", connectionDraft: null });
      return;
    }

    if (view.mode === "move") {
      const pointerPosition = getPointerPosition(event);
      if (!pointerPosition) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dispatchView({ type: "setPanning", panning: { pointerPosition, startPosition: view.pan } });
      dispatchView({ type: "setSelectedSurface", surfaceId: null });
      closeMenu();
      return;
    }

    dispatchView({ type: "setSelectedSurface", surfaceId: null });
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatchView({ type: "setSelectionBox", selectionBox: { start: gridPosition, end: gridPosition } });
    closeMenu();
  };

  const handleGridPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (view.selectionBox) {
      const gridPosition = getGridPosition(event);
      if (gridPosition) {
        dispatchView({ type: "setSelectionBox", selectionBox: { ...view.selectionBox, end: gridPosition } });
      }
      return;
    }
    if (!view.panning) return;
    const pointerPosition = getPointerPosition(event);
    if (!pointerPosition) return;
    dispatchView({
      type: "setPan", pan: {
        x: view.panning.startPosition.x + pointerPosition.x - view.panning.pointerPosition.x,
        y: view.panning.startPosition.y + pointerPosition.y - view.panning.pointerPosition.y,
      }
    });
  };

  const handleGridPointerUp = (event: PointerEvent<SVGRectElement>) => {
    if (view.selectionBox) {
      const gridPosition = getGridPosition(event);
      const selectionBox = gridPosition ? { ...view.selectionBox, end: gridPosition } : view.selectionBox;
      dispatchView({ type: "setSelection", selectedElements: getMarqueeSelection(selectionBox.start, selectionBox.end) });
      dispatchView({ type: "setSelectionBox", selectionBox: null });
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dispatchView({ type: "setPanning", panning: null });
  };

  const handleElementPointerDown = (event: PointerEvent<SVGGraphicsElement>, kind: "node" | "text" | "surface", element: Node | TextElement | Surface) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (view.mode === "move" || view.connectionDraft) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const target = { kind, id: element.id };
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      dispatchView({ type: "toggleSelection", element: target });
      dispatchView({ type: "setSelectedSurface", surfaceId: null });
      closeMenu();
      return;
    }

    const isSelected = view.selectedElements.some((selected) => selected.kind === kind && selected.id === element.id);
    const selectedElements = isSelected ? view.selectedElements : [target];
    const elements = selectedElements.flatMap((selected) => {
      const selectedElement = selected.kind === "node"
        ? documentState.nodes.find((node) => node.id === selected.id)
        : selected.kind === "text"
          ? documentState.texts.find((text) => text.id === selected.id)
          : documentState.surfaces.find((surface) => surface.id === selected.id);
      return selectedElement ? [{ ...selected, origin: getElementOrigin(selected.kind, selectedElement) }] : [];
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatchDocument({ type: "startMove" });
    dispatchView({ type: "setSelection", selectedElements });
    dispatchView({ type: "setDragging", dragging: { pointerPosition: snapToIsoGrid(gridPosition), elements } });
    dispatchView({ type: "setSelectedSurface", surfaceId: selectedElements.length === 1 && kind === "surface" ? element.id : null });
    closeMenu();
  };

  const handleElementPointerMove = (event: PointerEvent<SVGGraphicsElement>) => {
    const dragging = view.dragging;
    if (!dragging) return;
    const gridPosition = getGridPosition(event);
    if (!gridPosition) return;
    const snappedPointerPosition = snapToIsoGrid(gridPosition);
    const delta = { x: snappedPointerPosition.x - dragging.pointerPosition.x, y: snappedPointerPosition.y - dragging.pointerPosition.y };
    dragging.elements.forEach((dragged) => {
      const position = { x: dragged.origin.x + delta.x, y: dragged.origin.y + delta.y };
      if (dragged.kind === "node") {
        dispatchDocument({ type: "previewMoveNode", nodeId: dragged.id, position });
      } else if (dragged.kind === "text") {
        dispatchDocument({ type: "previewMoveText", textId: dragged.id, position });
      } else {
        dispatchDocument({ type: "previewMoveSurface", surfaceId: dragged.id, position });
      }
    });
  };

  const handleElementPointerUp = (event: PointerEvent<SVGGraphicsElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatchDocument({ type: "finishMove" });
    dispatchView({ type: "setDragging", dragging: null });
  };

  const handleSurfaceCornerPointerMove = (event: PointerEvent<SVGRectElement>) => {
    const resizingSurface = view.resizingSurface;
    if (!resizingSurface) return;

    const gridPosition = getGridPosition(event)
    const surface = documentState.surfaces.find((currentSurface) => currentSurface.id === resizingSurface.surfaceId);
    if (!gridPosition || !surface) return;
    const local = snapToIsoGrid(gridPosition);

    switch (resizingSurface.corner) {
      case "left":
        dispatchDocument({ type: "previewUpdateSurface", surfaceId: surface.id, changes: { x1: local.x, y1: local.y } });
        break;
      case "right":
        dispatchDocument({ type: "previewUpdateSurface", surfaceId: surface.id, changes: { x2: local.x, y2: local.y } });
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
    dispatchDocument({ type: "startMove" });
    dispatchView({ type: "setResizingSurface", resizingSurface: { surfaceId: surface.id, corner } });
  };

  const handleSurfaceCornerPointerUp = (event: PointerEvent<SVGRectElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dispatchDocument({ type: "finishMove" });
    dispatchView({ type: "setResizingSurface", resizingSurface: null });
  };

  const handleNodeClick = (event: MouseEvent<SVGPathElement>, node: Node) => {
    event.stopPropagation();
    const connectionDraft = view.connectionDraft;
    if (!connectionDraft || node.id === connectionDraft.sourceId) return;
    const connectionExists = documentState.connections.some((connection) =>
      (connection.sourceId === connectionDraft.sourceId && connection.targetId === node.id)
      || (connection.sourceId === node.id && connection.targetId === connectionDraft.sourceId),
    );
    if (!connectionExists) {
      dispatchDocument({ type: "addConnection", connection: createConnection(connectionDraft.sourceId, node.id) });
    }
    dispatchView({ type: "setConnectionDraft", connectionDraft: null });
  };

  // Right-clicking anywhere on a text's rendered label should open its menu, not just its center cell.
  const handleTextContextMenu = (event: MouseEvent<SVGRectElement>, text: TextElement) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    dispatchView({ type: "setHoverPos", position: { x: text.x, y: text.y } });
    dispatchView({ type: "setEditing", editing: null });
    dispatchView({ type: "setSelection", selectedElements: [] });
    dispatchView({
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
      x: (event.clientX - rect.left - view.pan.x) / zoom,
      y: (event.clientY - rect.top - view.pan.y) / zoom,
    });
    const node = documentState.nodes.find((currentNode) => currentNode.x === snappedPoint.x && currentNode.y === snappedPoint.y);
    const text = !node ? documentState.texts.find((currentText) => currentText.x === snappedPoint.x && currentText.y === snappedPoint.y) : undefined;
    dispatchView({ type: "setHoverPos", position: snappedPoint });
    dispatchView({ type: "setEditing", editing: null });
    dispatchView({ type: "setSelection", selectedElements: [] });
    dispatchView({
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
    const localX = (event.clientX - (rect?.left ?? 0) - view.pan.x) / zoom;
    const localY = (event.clientY - (rect?.top ?? 0) - view.pan.y) / zoom;
    dispatchView({ type: "setEditing", editing: null });
    dispatchView({ type: "setSelectedSurface", surfaceId: surface.id });
    dispatchView({ type: "setSelection", selectedElements: [] });
    dispatchView({
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

  // Right-clicking a connection opens its own menu instead of the empty-cell menu.
  const handleConnectionContextMenu = (event: MouseEvent<SVGPathElement>, connection: Connection) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    const localX = (event.clientX - (rect?.left ?? 0) - view.pan.x) / zoom;
    const localY = (event.clientY - (rect?.top ?? 0) - view.pan.y) / zoom;
    dispatchView({ type: "setEditing", editing: null });
    dispatchView({ type: "setSelection", selectedElements: [] });
    dispatchView({
      type: "setMenu", menu: {
        isOpen: true,
        x: localX,
        y: localY,
        side: rect && localX > 2 * rect.width / 3 ? "right" : "left",
        kind: "connection",
        connection,
      }
    });
  };

  const handleDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = snapToIsoGrid({
      x: (event.clientX - rect.left - view.pan.x) / zoom,
      y: (event.clientY - rect.top - view.pan.y) / zoom,
    });
    const hasElement = documentState.nodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y)
      || documentState.texts.some((text) => text.x === snappedPoint.x && text.y === snappedPoint.y);
    if (!hasElement) {
      dispatchDocument({ type: "addNode", node: createNode(snappedPoint.x, snappedPoint.y) });
    }
    dispatchView({ type: "setHoverPos", position: snappedPoint });
    dispatchView({ type: "setEditing", editing: null });
    closeMenu();
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => dispatchView({ type: "setHovering", isHovering: true })}
      onMouseLeave={() => dispatchView({ type: "setHovering", isHovering: false })}
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
          patternTransform={`translate(${view.pan.x} ${view.pan.y}) scale(${zoom})`}
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

      <g transform={`translate(${view.pan.x} ${view.pan.y}) scale(${zoom})`}>
        <path
          className="hover"
          d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
          transform={`translate(${view.hoverPos.x - midWidth} ${view.hoverPos.y - midHeight})`}
          style={{ opacity: view.isHovering && !view.dragging ? 1 : 0 }}
        />

        {documentState.surfaces.map((surface) => (
          <g key={surface.id}>
            <SurfaceShape
              surface={surface}
              selected={view.selectedSurfaceId === surface.id || view.selectedElements.some((selected) => selected.kind === "surface" && selected.id === surface.id)}
              showHandles={view.selectedSurfaceId === surface.id || (view.selectedElements.length === 1 && view.selectedElements[0].kind === "surface" && view.selectedElements[0].id === surface.id)}
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

        {documentState.connections.map((connection) => {
          const source = documentState.nodes.find((node) => node.id === connection.sourceId);
          const target = documentState.nodes.find((node) => node.id === connection.targetId);
          if (!source || !target) {
            return null;
          }

          return (
            <ConnectionLine
              key={connection.id}
              source={source}
              target={target}
              color={connection.color}
              dashed={connection.style === "dashed"}
              label={connection.label}
              selected={(view.menu.isOpen && view.menu.kind === "connection" && view.menu.connection?.id === connection.id) || (view.editing?.kind === "connection" && view.editing.connection.id === connection.id)}
              onContextMenu={(event) => handleConnectionContextMenu(event, connection)}
            />
          );
        })}
        {view.connectionDraft && (() => {
          const source = documentState.nodes.find((node) => node.id === view.connectionDraft!.sourceId);
          if (!source) {
            return null;
          }

          return (
            <ConnectionLine source={source} target={view.connectionDraft.pointerPosition} draft />
          );
        })()}

        {view.menu.isOpen && view.menu.kind === "empty" && (
          <path
            className="menu-selection"
            d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
            transform={`translate(${view.menu.x - midWidth} ${view.menu.y - midHeight})`}
          />
        )}

        {view.selectionBox && (
          <rect
            className="selection-box"
            x={Math.min(view.selectionBox.start.x, view.selectionBox.end.x)}
            y={Math.min(view.selectionBox.start.y, view.selectionBox.end.y)}
            width={Math.abs(view.selectionBox.end.x - view.selectionBox.start.x)}
            height={Math.abs(view.selectionBox.end.y - view.selectionBox.start.y)}
          />
        )}

        {documentState.nodes.map((node) => (
          <g key={node.id} className="node" transform={`translate(${node.x} ${node.y})`}>
            <ellipse cx="0" cy="0" rx={0.3 * midWidth} ry={0.3 * midHeight} stroke="black" fill="white" />
            {node.label && <line className="node-label-line" y2={-1.3 * grid.height} />}
            <image
              className="node-icon"
              href={node.icon.url}
              x={-midWidth}
              y={midHeight - (node.icon.height / node.icon.width * grid.width)}
              width={grid.width}
              preserveAspectRatio="xMidYMax meet"
            />
            {node.label && <NodeLabel label={node.label} y={-1.3 * grid.height} />}
            <path
              className="menu-selection"
              d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
              transform={`translate(${-midWidth} ${-midHeight})`}
              style={{ opacity: view.selectedElements.some((selected) => selected.kind === "node" && selected.id === node.id) || (view.menu.isOpen && view.menu.kind === "node" && view.menu.node?.id === node.id) || (view.editing?.kind === "node" && view.editing.node.id === node.id) ? 1 : 0 }}
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

        {documentState.texts.map((text) => (
          <g key={text.id} className="text-element" transform={`translate(${text.x} ${text.y})`}>
            <TextLabel
              text={text}
              selected={view.selectedElements.some((selected) => selected.kind === "text" && selected.id === text.id) || (view.menu.isOpen && view.menu.kind === "text" && view.menu.text?.id === text.id) || (view.editing?.kind === "text" && view.editing.text.id === text.id)}
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
