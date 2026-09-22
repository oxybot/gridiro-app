// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { useViewState } from "../state";

export function CanvasHover() {
  const view = useViewState();

  return (
    <g
      className="hover"
      transform={`translate(${view.hoverPos.x} ${view.hoverPos.y})`}
      style={{ opacity: view.isHovering && !view.dragging ? 1 : 0 }}
    >
      <g transform="scale(1.6 1) rotate(45)">
        <path d="M 10 0 L -10 0 M 0 10 L 0 -10" stroke="currentColor" strokeWidth="2" fill="none" />
      </g>
    </g>
  );
}