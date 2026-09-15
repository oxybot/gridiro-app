// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { PointerEvent } from "react";
import { grid, midHeight, midWidth, zoomLevels } from "../model/geometry";
import { useDocumentState, useViewDispatch, useViewState } from "../state";
import { usePosition } from "./hooks";
import type { BoundType } from "../model/types";
import { getNodeBounds } from "../model/node";
import { getTextBounds } from "../model/text";
import { getSurfaceBounds } from "../model/surface";

export function CanvasGrid() {
  const documentState = useDocumentState();
  const view = useViewState();
  const dispatchView = useViewDispatch();
  const { getCanvasPosition, getGridPosition } = usePosition(view);
  const zoom = zoomLevels[view.zoomIndex];

  const closeMenu = () => dispatchView({ type: "closeMenu" });

  const getMarqueeSelection = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const bounds = { minX: Math.min(start.x, end.x), minY: Math.min(start.y, end.y), maxX: Math.max(start.x, end.x), maxY: Math.max(start.y, end.y) };
    const isContained = (elementBounds: BoundType) =>
      elementBounds.minX >= bounds.minX
      && elementBounds.minY >= bounds.minY
      && elementBounds.maxX <= bounds.maxX
      && elementBounds.maxY <= bounds.maxY;

    return [
      ...documentState.nodes.filter((node) => isContained(getNodeBounds(node))).map((node) => ({ kind: "node" as const, id: node.id })),
      ...documentState.texts.filter((text) => isContained(getTextBounds(text))).map((text) => ({ kind: "text" as const, id: text.id })),
      ...documentState.surfaces.filter((surface) => isContained(getSurfaceBounds(surface))).map((surface) => ({ kind: "surface" as const, id: surface.id })),
    ];
  };

  const handleGridPointerDown = (event: PointerEvent<SVGRectElement>) => {
    if (event.button !== 0) return;
    if (view.connectionDraft) {
      dispatchView({ type: "setConnectionDraft", connectionDraft: null });
      return;
    }

    if (view.mode === "move") {
      const pointerPosition = getCanvasPosition(event);
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
    const pointerPosition = getCanvasPosition(event);
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

  return (
    <>
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
    </>
  );
}
