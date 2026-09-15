// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { PointerEvent } from "react";
import { snapToIsoGrid, zoomLevels } from "../model/geometry";
import type { ViewState } from "../model/types";

function getCanvasPosition(event: { clientX: number; clientY: number; currentTarget: SVGElement }) {
  const svg = event.currentTarget.ownerSVGElement ?? event.currentTarget;
  if (!svg) {
    return null;
  }

  const rect = svg.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

export function usePosition(view: ViewState) {
  const zoom = zoomLevels[view.zoomIndex];

  const getSnappedPosition = (event: { clientX: number; clientY: number; currentTarget: SVGElement }) => {
    const pointerPosition = getCanvasPosition(event);
    return pointerPosition
      ? snapToIsoGrid({ x: (pointerPosition.x - view.pan.x) / zoom, y: (pointerPosition.y - view.pan.y) / zoom })
      : null;
  };

  const getGridPosition = (event: PointerEvent<SVGElement>) => {
    const pointerPosition = getCanvasPosition(event);
    return pointerPosition ? { x: (pointerPosition.x - view.pan.x) / zoom, y: (pointerPosition.y - view.pan.y) / zoom } : null;
  };

  return { getCanvasPosition, getSnappedPosition, getGridPosition };
}
