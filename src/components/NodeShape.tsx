// Copyright (C) 2026 Gridiro
// SPDX-License-Identifier: GPL-3.0-or-later

import { grid, midHeight, midWidth } from "../model/geometry";
import { useDocumentDispatch, useDocumentState, useViewDispatch, useViewState } from "../state";
import type { Node } from "../model/types";
import { NodeLabel } from "./NodeLabel";
import type { MouseEvent, PointerEvent } from "react";
import { createConnection } from "../model/connection";

type NodeShapeProps = {
  node: Node;
  onElementPointerDown: (event: PointerEvent<SVGGraphicsElement>, kind: "node", element: Node) => void;
  onElementPointerMove: (event: PointerEvent<SVGGraphicsElement>) => void;
  onElementPointerUp: (event: PointerEvent<SVGGraphicsElement>) => void;
};
export function NodeShape({ node, onElementPointerDown, onElementPointerMove, onElementPointerUp }: NodeShapeProps) {
  const view = useViewState();
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const dispatchView = useViewDispatch();

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

  return (
    <g className="node" transform={`translate(${node.x} ${node.y})`}>
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
        onPointerDown={(event) => onElementPointerDown(event, "node", node)}
        onPointerMove={onElementPointerMove}
        onPointerUp={onElementPointerUp}
        onClick={(event) => handleNodeClick(event, node)}
      />
    </g>

  )
}