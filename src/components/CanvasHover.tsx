// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { grid, midHeight, midWidth } from "../model/geometry";
import { useViewState } from "../state";

export function CanvasHover() {
  const view = useViewState();
  return (
    <path
      className="hover"
      d={`M 0 ${midHeight} L ${midWidth} 0 ${grid.width} ${midHeight} ${midWidth} ${grid.height} 0 ${midHeight}`}
      transform={`translate(${view.hoverPos.x - midWidth} ${view.hoverPos.y - midHeight})`}
      style={{ opacity: view.isHovering && !view.dragging ? 1 : 0 }}
    />
  );
}