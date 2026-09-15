// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { MouseEvent, ReactNode } from "react";
import { useDocumentDispatch, useDocumentState, useViewDispatch, useViewState } from "../state";
import { zoomLevels, snapToIsoGrid } from "../model/geometry";
import { usePosition } from "./hooks";
import { createNode } from "../model/node";

export function CanvasSvg({ children }: { children: ReactNode }) {
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const view = useViewState();
  const dispatchView = useViewDispatch();
  const [getCanvasPosition, getSnappedPosition] = usePosition(view);
  const zoom = zoomLevels[view.zoomIndex];

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const pointerPosition = getCanvasPosition(event);
    if (!pointerPosition) return;
    const position = { x: (pointerPosition.x - view.pan.x) / zoom, y: (pointerPosition.y - view.pan.y) / zoom };
    dispatchView({ type: "setHoverPos", position: snapToIsoGrid(position) });
    if (view.connectionDraft) {
      dispatchView({ type: "setConnectionDraft", connectionDraft: { ...view.connectionDraft, pointerPosition: position } });
    }
  };

  const handleContextMenu = (event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const snappedPoint = getSnappedPosition(event);
    if (!snappedPoint) return;
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

  const handleDoubleClick = (event: MouseEvent<SVGSVGElement>) => {
    const snappedPoint = getSnappedPosition(event);
    if (!snappedPoint) return;
    const hasElement = documentState.nodes.some((node) => node.x === snappedPoint.x && node.y === snappedPoint.y)
      || documentState.texts.some((text) => text.x === snappedPoint.x && text.y === snappedPoint.y);
    if (!hasElement) {
      dispatchDocument({ type: "addNode", node: createNode(snappedPoint.x, snappedPoint.y) });
    }
    dispatchView({ type: "setHoverPos", position: snappedPoint });
    dispatchView({ type: "setEditing", editing: null });
    closeMenu();
  };

  const closeMenu = () => dispatchView({ type: "closeMenu" });

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => dispatchView({ type: "setHovering", isHovering: true })}
      onMouseLeave={() => dispatchView({ type: "setHovering", isHovering: false })}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </svg>
  )
}
