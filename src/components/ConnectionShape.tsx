// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import type { MouseEvent } from "react";
import { grid, midHeight, midWidth } from "../model/geometry";
import type { Connection, ConnectionDraft } from "../model/types";
import { useDocumentState } from "../state";

type ConnectionShapeProps = {
  connection: Connection;
  selected?: boolean;
  onContextMenu?: (event: MouseEvent<SVGPathElement>) => void;
};

export function ConnectionShape({ connection, selected, onContextMenu }: ConnectionShapeProps) {
  const documentState = useDocumentState();
  const source = documentState.nodes.find((node) => node.id === connection.sourceId);
  const target = documentState.nodes.find((node) => node.id === connection.targetId);
  if (!source || !target) {
    return null;
  }

  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const a = deltaX / grid.width - deltaY / grid.height;
  const b = deltaX / grid.width + deltaY / grid.height;

  const d = a === 0 || b === 0
    ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
    : `M ${source.x} ${source.y}
        l ${a * midWidth / 2} ${-a * midHeight / 2},
          ${b * midWidth} ${b * midHeight},
          ${a * midWidth / 2} ${-a * midHeight / 2}`;
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;

  return (
    <g>
      {onContextMenu && (
        <path className="connection-hit" d={d} onContextMenu={onContextMenu} />
      )}
      <path
        className={`connection${connection.style === "dashed" ? " dashed" : ""}${selected ? " selected" : ""}`}
        style={connection.color ? { stroke: connection.color } : undefined}
        d={d}
      />
      {connection.label && (
        <text className="connection-label" x={midX} y={midY}>{connection.label}</text>
      )}
    </g>
  );
}

type ConnectionDraftShapeProps = {
  connectionDraft: ConnectionDraft;
};

export function ConnectionDraftShape({ connectionDraft }: ConnectionDraftShapeProps) {
  const documentState = useDocumentState();

  const source = documentState.nodes.find((node) => node.id === connectionDraft!.sourceId);
  if (!source) {
    return null;
  }

  const target = connectionDraft.pointerPosition;

  const deltaX = target.x - source.x;
  const deltaY = target.y - source.y;
  const a = deltaX / grid.width - deltaY / grid.height;
  const b = deltaX / grid.width + deltaY / grid.height;

  const d = a === 0 || b === 0
    ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
    : `M ${source.x} ${source.y}
        l ${a * midWidth / 2} ${-a * midHeight / 2},
          ${b * midWidth} ${b * midHeight},
          ${a * midWidth / 2} ${-a * midHeight / 2}`;

  return (
    <path className="connection draft" d={d} />
  );
}
